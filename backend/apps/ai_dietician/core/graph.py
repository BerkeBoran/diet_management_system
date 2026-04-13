import json
import re

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.constants import START, END
from langgraph.graph import StateGraph
from django.conf import settings

from apps.ai_dietician.core.prompts import ANALYSIS_SYSTEM_PROMPT, DIET_GENERATION_PROMPT
from apps.ai_dietician.core.state import DieticianState

llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", temperature=0.2, google_api_key=settings.GOOGLE_API_KEY)

def extract_json(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", text).strip()
    return json.loads(cleaned)

def analysis_node(state: DieticianState):
    user_info = state["user_info"]


    response = llm.invoke([
        ("system", ANALYSIS_SYSTEM_PROMPT),
        ("human", f"Kullanıcı verileri:\n{json.dumps(user_info, ensure_ascii=False, indent=2)}")
    ])

    content = response.content
    if isinstance(content, list):
        text = next(
            (block["text"] for block in content if isinstance(block, dict) and block.get("type") == "text"),
            ""
        )
    else:
        text = content

    return {"analysis_notes": text}

def diet_generator_node(state: DieticianState):
    past_diets = state["all_past_diets"]
    notes = state["analysis_notes"]

    final_prompt = DIET_GENERATION_PROMPT.format(
        analysis_notes=notes,
        past_diets_input=past_diets
    )

    response = llm.invoke([
        ("system", "Sen yaratıcı ve uzman bir diyetisyensin. Yanıtını her zaman geçerli JSON formatında ver."),
        ("human", final_prompt)
    ])
    content = response.content
    if isinstance(content, list):
        text = next(
            (block["text"] for block in content if isinstance(block, dict) and block.get("type") == "text"),
            ""
        )
    else:
        text = content

    print(f"DEBUG - AI RESPONSE TEXT: {text}")

    try:
        data = extract_json(text)
        return {
            "messages": [("assistant", data["content"])],
            "diet_summary": data["summary"][:100]
        }
    except (json.JSONDecodeError, KeyError) as e:
        return {
            "messages": [("assistant", text)],
            "diet_summary": text[:100]
        }


workflow = StateGraph(DieticianState)

workflow.add_node("health_analysis_node", analysis_node)
workflow.add_node("diet_generator_node", diet_generator_node)

workflow.add_edge(START, "health_analysis_node")
workflow.add_edge("health_analysis_node", "diet_generator_node")
workflow.add_edge("diet_generator_node", END)

diet_graph = workflow.compile()