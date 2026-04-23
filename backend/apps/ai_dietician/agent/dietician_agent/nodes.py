import json

from langchain_google_genai import ChatGoogleGenerativeAI

from apps.ai_dietician.agent.config import DIETICIAN_AGENT_MODEL_NAME, MODEL_TEMPERATURE, GOOGLE_API_KEY
from apps.ai_dietician.agent.dietician_agent.prompts import ANALYSIS_SYSTEM_PROMPT, DIET_HUMAN_PROMPT, \
    DIET_SYSTEM_PROMPT
from apps.ai_dietician.agent.dietician_agent.schemas import DietResponse
from apps.ai_dietician.agent.dietician_agent.state import DieticianState
from apps.ai_dietician.models.ai_diet_plan import AiDietPlan
from apps.users.models import Client
from apps.users.models.client import WeightLog

llm = ChatGoogleGenerativeAI(model=DIETICIAN_AGENT_MODEL_NAME, temperature=MODEL_TEMPERATURE, google_api_key=GOOGLE_API_KEY)

def loader_node(state: DieticianState):
    user_id = state["user_id"]
    client = Client.objects.get(id=user_id)
    weight_history = WeightLog.objects.filter(client=client).order_by("-created_at")[:2]

    current_weight = weight_history[0].weight if len(weight_history) > 0 else 0
    previous_weight = weight_history[1].weight if len(weight_history) > 1 else current_weight

    user_info = state.get("user_info", {})
    user_info["current_weight"] = float(current_weight)
    user_info["previous_weight"] = float(previous_weight)

    return {
        "user_info": user_info,
        "analysis_notes": client.static_analysis or "",
    }

def analysis_node(state: DieticianState):
    if state["analysis_notes"] and not state.get("force_refresh_analysis"):
        return {"analysis_notes": state["analysis_notes"]}

    user_info_json = json.dumps(state["user_info"], ensure_ascii=False, indent=2)

    response = llm.invoke([
        ("system", ANALYSIS_SYSTEM_PROMPT),
        ("human", f"Kullanıcı Bilgileri: {user_info_json}")
    ])

    analysis_text = response.content



    client = Client.objects.get(id=state["user_id"])
    client.static_analysis = analysis_text
    client.save()

    return {
        "analysis_notes": analysis_text,
    }



def diet_generator_node(state: DieticianState):
    current_weight = state["user_info"]["current_weight"]
    previous_weight = state["user_info"]["previous_weight"]
    weight_status = ""

    if current_weight > previous_weight:
        weight_status = f"Kişi önceki haftaya göre {current_weight-previous_weight} kg kilo almış"
    if current_weight < previous_weight:
        weight_status = f"Kişi önceki haftaya göre {previous_weight-current_weight} kg kilo vermiş"
    else:
        weight_status = "Kişi önceki haftadaki kilosunu korumuştur"

    final_human_prompt = DIET_HUMAN_PROMPT.format(
        analysis_notes=state["analysis_notes"],
        past_diets_input=state["all_past_diets"],
        current_diet=state.get("current_diet", "Yok"),
        revision_request=state.get("revision_request", "Yok"),
        weight_status = weight_status,
        current_weight = current_weight
    )

    structured_llm = llm.with_structured_output(DietResponse)

    response = structured_llm.invoke([
        ("system", DIET_SYSTEM_PROMPT),
        ("human", final_human_prompt)
    ])

    diet_plan_dict_list = [meal.model_dump() for meal in response.meals]

    return {
        "diet_plan": diet_plan_dict_list,
        "current_diet": response.content,
        "summary": response.summary[:100],
        "revision_request": ""
    }