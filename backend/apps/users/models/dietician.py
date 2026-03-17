from backend.apps.users.models.base import User
from django.db import models


class Dietician(User):
    class VerificationStatus(models.TextChoices):
        PENDING = 'Pending'
        ACCEPTED = 'Accepted'
        REJECTED = 'Rejected'

    tc_no = models.CharField(max_length=11, unique=True)
    tc_verified = models.BooleanField(default=False)
    license_number = models.CharField(max_length=50, blank=True)
    license_document = models.FileField(upload_to='licenses/%Y/%m/%d/', blank=True)
    biography = models.TextField(blank=True)

    verification_status = models.CharField(
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )

    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

