from langgraph.checkpoint.memory import MemorySaver
from langgraph.constants import END
from langgraph.graph import StateGraph

from apps.ai_dietician.agent.dietician_agent.nodes import analysis_node, diet_generator_node, loader_node
from apps.ai_dietician.agent.dietician_agent.state import DieticianState

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