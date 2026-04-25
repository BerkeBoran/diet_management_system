from langgraph.constants import START, END
from langgraph.graph import StateGraph

from apps.ai_dietician.agent.meal_checker_agent.nodes import feedback_generator_node, save_log_node
from apps.ai_dietician.agent.meal_checker_agent.state import MealCheckerState
from apps.ai_dietician.agent.meal_checker_agent.subgraphs import evaluator_subgraph

main_workflow = StateGraph(MealCheckerState)

main_workflow.add_node("evaluator_workflow",evaluator_subgraph)
main_workflow.add_node("feedback_generator", feedback_generator_node)
main_workflow.add_node("save_log", save_log_node)


main_workflow.add_edge(START,"evaluator_workflow")
main_workflow.add_edge("evaluator_workflow","feedback_generator")
main_workflow.add_edge("feedback_generator","save_log")
main_workflow.add_edge("save_log", END)


meal_checker_graph = main_workflow.compile()