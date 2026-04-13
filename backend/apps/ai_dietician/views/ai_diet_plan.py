from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.ai_dietician.core.graph import diet_graph
from apps.ai_dietician.models.ai_diet_plan import AiDietPlan
from apps.ai_dietician.tools.db_queries import get_user_details, get_past_ai_diest_summary


class AICreateDietView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        try:
            user_context = get_user_details(user)
            past_diets_text = get_past_ai_diest_summary(user)

            initial_state = {
                "messages": [],
                "user_info": user_context,
                "all_past_diets": past_diets_text,
                "analysis_notes": ""
            }

            final_state = diet_graph.invoke(initial_state)

            ai_content = final_state["messages"][-1].content
            ai_summary = final_state.get("diet_summary")

            diet_plan = AiDietPlan.objects.create(
                user=user,
                content=ai_content,
                summary=ai_summary,
                client_snapshot=user_context,
            )

            return Response({
                "id": diet_plan.id,
                "summary": ai_summary,
                "content": ai_content,
                "created_at": diet_plan.created_at,
            },
            status=status.HTTP_201_CREATED)

        except Exception as e:

            print(f"AI Error: {str(e)}")
            return Response({
                "error": "Diyet oluşturulurken hata oluştur"},status=status.HTTP_500_INTERNAL_SERVER_ERROR)