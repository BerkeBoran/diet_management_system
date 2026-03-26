from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models.assignment import DieticianAssignment


@shared_task(name="check_ended_assignments_task")
def check_ended_assignments():
    now = timezone.now()
    active_assignments = DieticianAssignment.objects.filter(
        status=DieticianAssignment.Status.INPROGRESS,
        accepted_at__isnull=False
    )

    mapping = {'1M': 30, '3M': 90, '6M': 180, '12M': 365}

    updated_count = 0
    for assignment in active_assignments:
        days = mapping.get(assignment.duration, 30)
        ended_date = assignment.accepted_at + timedelta(days=days)

        if now >= ended_date:
            assignment.status = DieticianAssignment.Status.ENDED
            assignment.save()
            updated_count += 1

    return f"{updated_count} atama sonlandırıldı."