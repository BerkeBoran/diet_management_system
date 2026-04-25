import base64
from datetime import date

from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from apps.ai_dietician.agent.config import DIETICIAN_AGENT_MODEL_NAME, MODEL_TEMPERATURE, GOOGLE_API_KEY
from apps.ai_dietician.agent.meal_checker_agent.prompts import VISION_ANALYSIS_PROMPT, MEAL_CHECKER_FEEDBACK_PROMPT
from apps.ai_dietician.agent.meal_checker_agent.schemas import VisionAnalysis
from apps.ai_dietician.agent.meal_checker_agent.state import MealCheckerState
from apps.ai_dietician.agent.meal_checker_agent.utils import get_mime_type
from apps.ai_dietician.models.ai_diet_plan import AiDietMeal, AiDietPlan
from apps.ai_dietician.models.ai_meal_checker import AiMealChecker

llm = ChatGoogleGenerativeAI(model=DIETICIAN_AGENT_MODEL_NAME, temperature=MODEL_TEMPERATURE, google_api_key=GOOGLE_API_KEY)


def vision_analysis_node(state: MealCheckerState) -> dict:

    if state.get("error"):
        return {}

    try:

        image_data_uri = state["image_url"]

        message = HumanMessage(
            content= [
                {
                 "type": "text",
                 "text":VISION_ANALYSIS_PROMPT

                 },
                {
                    "type": "image_url",
                    "image_url": {"url": image_data_uri}

                }
            ]
        )

        structured_llm = llm.with_structured_output(VisionAnalysis)
        response = structured_llm.invoke([message])

        if not response.is_food:
            return {
                "vision_analysis": response,
                "error": "Görselde yemek tespit edilemedi."
            }

        return {
            "vision_analysis": response,
            "error": None
        }

    except Exception as e:

        print(f"[Vision Node Error]: {str(e)}")

        return {
            "vision_analysis": None,
            "error": str(e)
        }



def fetch_food_node(state: MealCheckerState) -> dict:

    if state.get("error"):
        return {}

    try:
        plan = AiDietMeal.objects.filter(
            diet_plan__user_id = state["user_id"],
            day = state["target_date"],
            meal_type = state["meal_type"]
        ).first()

        plan_dict = {
            "contents": getattr(plan, "contents", ""),
            "calories": getattr(plan, "calories", 0),
        }

        return {
            "diet_plan": plan_dict,
            "error": None
        }

    except Exception as e:

        return {
            "diet_plan": None,
            "error": str(e)
        }


def compliance_math_node(state: MealCheckerState) -> dict:

    if state.get("error"):
        return {}

    try:
        if "vision_analysis" not in state:
            return {"error": "Görüntü analizi eksik"}

        vision = state["vision_analysis"]
        total_calories = vision.total_calories if vision else 0

        if state.get("meal_type") == "Kaçamak":
            return {"calorie_diff": float(total_calories)}

        plan_calories = state["diet_plan"].get("calories", 0)
        diff = total_calories - plan_calories

        return {
            "calorie_diff": float(diff),
            "error": None
        }

    except Exception as e:
        return {
            "calorie_diff": None,
            "error": str(e)
        }


def feedback_generator_node(state: dict) -> dict:

    if state.get("error"):
        return {}

    try:

        vision = state.get("vision_analysis", {})
        plan = state.get("diet_plan", {})

        total_calories = vision.total_calories if vision else 0
        target_calories = plan.get("calories", 0) if plan else 0
        contents = plan.get("contents", "") if plan else ""
        foods_str = "\n".join([f"- {f.name} ({f.portion})" for f in vision.foods]) if vision else "Belirsiz"

        final_prompt = MEAL_CHECKER_FEEDBACK_PROMPT.format(
            total_calories = total_calories,
            meal_type = state.get("meal_type", ""),
            contents = contents,
            calorie_diff = state.get("calorie_diff", 0),
            foods = foods_str,
            target_calories = target_calories,


        )

        response = llm.invoke(final_prompt)
        return {
            "feedback": response.content,
            "error": None
        }

    except Exception as e:
        return {
            "feedback": "Geri bildirim oluşturulamadı.",
            "error": str(e)
                }


def save_log_node(state: dict) -> dict:

    if state.get("error"):
        return {}

    try:
        is_cheat = (state.get("meal_type") == "Kaçamak")
        logged_at = date.fromisoformat(state.get("target_date"))
        vision: VisionAnalysis = state.get("vision_analysis")


        vision_data = vision.model_dump() if vision else {}


        AiMealChecker.objects.create(
            user_id=state.get("user_id"),
            meal_type=state.get("meal_type"),
            vision_data=vision_data,
            calorie_diff=state.get("calorie_diff", 0.0),
            feedback=state.get("feedback", ""),
            logged_at=logged_at,
            is_cheat=is_cheat
        )
        return {
            "message": "Geri bildirimi kaydedildi.",
            "error": None
        }

    except Exception as e:
        return {
            "message": None,
            "error": str(e)
        }