import json
import re

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.constants import START, END
from langgraph.graph import StateGraph
from django.conf import settings

from apps.ai_dietician.core.prompts import ANALYSIS_SYSTEM_PROMPT, ANALYSIS_HUMAN_PROMPT, \
    DIET_HUMAN_PROMPT, DIET_SYSTEM_PROMPT
from apps.ai_dietician.core.state import DieticianState
from apps.users.models import Client
from apps.users.models.client import WeightLog

llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", temperature=0.2, google_api_key=settings.GOOGLE_API_KEY)

def extract_json(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", text).strip()
    return json.loads(cleaned)



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

    return {"analysis_notes": analysis_text}

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
    response = llm.invoke([
        ("system", DIET_SYSTEM_PROMPT),
        ("human", final_human_prompt)
    ])
    content = response.content
    if isinstance(content, list):
        text = next(
            (block["text"] for block in content if isinstance(block, dict) and block.get("type") == "text"),
            ""
        )
    else:
        text = content


    try:
        data = extract_json(text)
        return {
            "current_diet": data["content"],
            "diet_summary": data["summary"][:100],
            "revision_request": ""
        }
    except (json.JSONDecodeError, KeyError) as e:
        return {
            "current_diet": text,
            "diet_summary": text[:100],
            "revision_request": ""
        }


def should_continue(state: DieticianState):
    if state.get("is_finished"):
        return END
    return "diet_generator_node"

def router_logic(state: DieticianState):
    if not state.get("analysis_notes") or state.get("force_refresh_analysis"):
        return "need_analysis"
    return "skip_to_generate"

workflow = StateGraph(DieticianState)

workflow.add_node("health_analysis_node", analysis_node)
workflow.add_node("diet_generator_node", diet_generator_node)
workflow.add_node("loader_node", loader_node)

workflow.set_entry_point("loader_node")

workflow.add_conditional_edges(
    "loader_node",
    router_logic,
    {
        "need_analysis": "health_analysis_node",
        "skip_to_generate": "diet_generator_node"
    }
)
workflow.add_edge("health_analysis_node", "diet_generator_node")

workflow.add_conditional_edges(
    "diet_generator_node",
    should_continue,
    {
        "diet_generator_node": "diet_generator_node",
        END: END
    }
)
memory = MemorySaver()

diet_graph = workflow.compile(
    checkpointer=memory,
    interrupt_after=["diet_generator_node"],
)