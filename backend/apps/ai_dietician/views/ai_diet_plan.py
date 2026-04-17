import uuid

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.ai_dietician.core.graph import diet_graph
from apps.ai_dietician.models.ai_diet_plan import AiDietPlan
from apps.ai_dietician.tools.db_queries import get_user_details, get_past_ai_diet_summary


class AICreateDietView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        thread_id = request.data.get("thread_id")
        revision_note = request.data.get("revision_note")
        action = request.data.get("action", "start")
        force_refresh_analysis = request.data.get("force_refresh_analysis", False)

        config = {"configurable": {"thread_id": thread_id or str(uuid.uuid4())}}

        try:
            if action == "start":
                user_context = get_user_details(user)
                past_diets_text = get_past_ai_diet_summary(user)

                initial_state = {
                    "user_id": user.id,
                    "force_refresh_analysis": force_refresh_analysis,
                    "user_info": user_context,
                    "all_past_diets": past_diets_text,
                    "is_finished": False,
                    "revision_request": "",
                    "analysis_notes": "",
                    "current_diet": ""
                }
                diet_graph.invoke(initial_state, config)

            elif action == "revise":
                diet_graph.update_state(config, {
                    "revision_request": revision_note,
                    "is_finished": False,
                })
                diet_graph.invoke(None, config)

            elif action == "approve":
                diet_graph.update_state(config, {"is_finished": True})
                diet_graph.invoke(None, config)

                final_state = diet_graph.get_state(config).values
                diet_plan = AiDietPlan.objects.create(
                    user=user,
                    content=final_state["current_diet"],
                    summary=final_state["diet_summary"],
                    client_snapshot=final_state["user_info"]
                )
                return Response({"message": "Diyet kaydedildi"})

            current_state = diet_graph.get_state(config).values
            return Response({
                "thread_id": config["configurable"]["thread_id"],
                "content": current_state.get("current_diet"),
                "summary": current_state.get("diet_summary"),
                "options": ["Onayla", "Değişiklik Yap"]
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)