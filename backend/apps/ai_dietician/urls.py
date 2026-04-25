from django.urls import path

from apps.ai_dietician.views.ai_diet_plan import AICreateDietView
from apps.ai_dietician.views.ai_meal_checker import AIMealCheckerView

urlpatterns = [
    path('generate/', AICreateDietView.as_view(), name='ai-generate-create'),
    path('meal-checker/', AIMealCheckerView.as_view(), name='ai-meal-checker')
]