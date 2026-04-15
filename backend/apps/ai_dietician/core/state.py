from typing import TypedDict


class DieticianState(TypedDict):

    user_info: dict
    all_past_diets: str
    analysis_notes: str
    diet_summary: str
    revision_request: str
    is_finished: bool
    current_diet: str