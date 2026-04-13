from django.urls import path

from apps.ai_dietician.views.ai_diet_plan import AICreateDietView

urlpatterns = [
    path('generate/', AICreateDietView.as_view(), name='ai-generate-create'),
]