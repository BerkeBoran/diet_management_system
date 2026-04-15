from apps.ai_dietician.models.ai_diet_plan import AiDietPlan


def get_past_ai_diet_summary(user):
    past_plans = AiDietPlan.objects.filter(user=user)[:4]

    if not past_plans:
        return "Daha önce AI tarafından hazırlanmış bir plan bulunmuyor."

    summary = ""

    for plan in past_plans:
        weight = plan.client_snapshot.get('weight', 'Bilinmiyor')
        summary += f"Tarih: {plan.created_at.date()} -(Kilo: {weight}\nİçerik Özeti: {plan.content[:300]}...\n---\n"

    return summary


def get_user_details(user):

    context = {
        "age": getattr(user, 'age', None),
    }

    client = getattr(user, 'client', None)

    if client:
        context.update({
            "height": client.height,
            "weight": client.weight,
            "gender": client.gender,
            "allergies": client.allergies,
            "chronic_conditions": client.chronic_conditions,
        })

    client_health_snapshot = client.client_health_snapshots.order_by('-id').first()

    if client_health_snapshot:
        context.update({
            "dietary_preference": client_health_snapshot.dietary_preference,
            "activity_level": client_health_snapshot.activity_level,
            "goal": client_health_snapshot.goal,
            "is_pregnant": client_health_snapshot.is_pregnant,
            "is_breastfeeding": client_health_snapshot.is_breastfeeding,
            "alcohol_use": client_health_snapshot.alcohol_use,
            "smoking_use": client_health_snapshot.smoking_use,
            "dislike_foods": client_health_snapshot.dislike_foods,
            "medications": client_health_snapshot.medications,
            "sugar_intake": client_health_snapshot.sugar_intake,
        })

    return context





