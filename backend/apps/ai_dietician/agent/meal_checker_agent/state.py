from typing import Optional, TypedDict, Literal, Required

from apps.ai_dietician.agent.meal_checker_agent.schemas import VisionAnalysis


class MealCheckerState(TypedDict):
    user_id: Required[int]
    target_date: Required[str]
    meal_type: Required[Literal["Kahvaltı","1.Ara Öğün","Öğlen Yemeği","2.Ara Öğün","Akşam Yemeği","3.Ara Öğün","4.Ara Öğün", "Kaçamak"]]
    image_url: Required[str]


    diet_plan: Optional[dict]
    vision_analysis: Optional[VisionAnalysis]
    calorie_diff: float
    feedback: str
    error: str
