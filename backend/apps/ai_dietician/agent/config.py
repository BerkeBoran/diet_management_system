import os

from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
DIETICIAN_AGENT_MODEL_NAME = "gemini-3-flash-preview"
MEAL_CHECHKER_AGENT_MODEL_NAME = os.getenv('MEAL_CHECKER_AGENT_MODEL_NAME')

MODEL_TEMPERATURE = 0.2
MAX_RETRIES = 3
RECURSION_LIMIT=25