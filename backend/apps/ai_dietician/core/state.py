from typing import TypedDict, Annotated

from langgraph.graph import add_messages


class DieticianState(TypedDict):

    messages: Annotated[list, add_messages]
    user_info: dict
    all_past_diets: str
    analysis_notes: str
    diet_summary: str