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

llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", temperature=0.2, google_api_key=settings.GOOGLE_API_KEY)

def extract_json(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", text).strip()
    return json.loads(cleaned)

def analysis_node(state: DieticianState):
    user_info_json = json.dumps(state["user_info"], ensure_ascii=False, indent=2)
    final_human_prompt = ANALYSIS_HUMAN_PROMPT.format(user_info_json=user_info_json)

    response = llm.invoke([
        ("system", ANALYSIS_SYSTEM_PROMPT),
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

    return {"analysis_notes": text}

def diet_generator_node(state: DieticianState):
    final_human_prompt = DIET_HUMAN_PROMPT.format(
        analysis_notes=state["analysis_notes"],
        past_diets_input=state["all_past_diets"],
        current_diet=state.get("current_diet", "Yok"),
        revision_request=state.get("revision_request", "Yok")
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


workflow = StateGraph(DieticianState)

workflow.add_node("health_analysis_node", analysis_node)
workflow.add_node("diet_generator_node", diet_generator_node)

workflow.add_edge(START, "health_analysis_node")
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