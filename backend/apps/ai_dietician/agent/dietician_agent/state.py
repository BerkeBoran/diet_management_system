from typing import TypedDict, List


class Meal(TypedDict):
    day: str
    meal_type: str
    contents: str
    calories: int

class DieticianState(TypedDict):

    user_id: int
    force_refresh_analysis: bool
    user_info: dict
    all_past_diets: str
    analysis_notes: str
    summary: str
    revision_request: str
    is_finished: bool
    current_diet: str
    diet_plan: List[Meal]
    analysis_notes: str