import base64

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai_dietician.agent.meal_checker_agent.graph import meal_checker_graph


class AIMealCheckerView(APIView):
    permission_classes = [IsAuthenticated]


    def post(self, request):
        meal_type = request.data.get('meal_type')
        target_date = request.data.get('target_date')
        image_file = request.FILES.get('image_file')

        errors = {}
        if not meal_type:
            errors["meal_type"] = "Bu alan zorunludur."
        if not target_date:
            errors["target_date"] = "Bu alan zorunludur."
        if not image_file:
            errors["image"] = "Görsel zorunludur."

        if errors:
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image_bytes = image_file.read()
            mime_type = image_file.content_type
            base64_str = base64.b64encode(image_bytes).decode("utf-8")
            image_data_uri = f"data:{mime_type};base64,{base64_str}"
        except Exception as e:
            return Response(
                {"error": f"Görsel işlenemedi: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        initial_state = {
            "user_id": request.user.id,
            "meal_type": meal_type,
            "target_date": target_date,
            "image_url": image_data_uri,
        }

        try:
            result = meal_checker_graph.invoke(initial_state)
        except Exception as e:
            return Response(
                {"error": f"Graph çalıştırılamadı: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if result.get("error"):
            return Response(
                {"error": result["error"]},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        vision = result.get("vision_analysis")

        return Response({
            "feedback": result.get("feedback", ""),
            "calorie_diff": result.get("calorie_diff", 0),
            "vision_summary": {
                "total_calories": vision.total_calories if vision else 0,
                "foods": vision.foods if vision else [],
            },
            "message": result.get("message", ""),
        }, status=status.HTTP_200_OK)

