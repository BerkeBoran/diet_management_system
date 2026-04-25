from langgraph.constants import START, END
from langgraph.graph import StateGraph

from apps.ai_dietician.agent.meal_checker_agent.nodes import vision_analysis_node, fetch_food_node, compliance_math_node
from apps.ai_dietician.agent.meal_checker_agent.state import MealCheckerState


def route_meal_type(state: MealCheckerState) -> dict:

    if state.get("meal_type") == "Kaçamak":

        return "go_to_math"

    return "go_to_plan"


evaluator_workflow = StateGraph(MealCheckerState)
evaluator_workflow.add_node("vision_analysis", vision_analysis_node)
evaluator_workflow.add_node("fetch_food", fetch_food_node)
evaluator_workflow.add_node("compliance_math", compliance_math_node)

evaluator_workflow.add_edge(START,"vision_analysis")

evaluator_workflow.add_conditional_edges("vision_analysis",route_meal_type,
{
            "go_to_math": "compliance_math",
            "go_to_plan": "fetch_food"

}
)

evaluator_workflow.add_edge("fetch_food","compliance_math")
evaluator_workflow.add_edge("compliance_math", END)

evaluator_subgraph = evaluator_workflow.compile()
