from .base import User
from django.db import models


class Dietician(User):
    class AppointmentDuration(models.IntegerChoices):
        SHORT = 30, '30 Dakika'
        MEDIUM = 45, '45 Dakika'
        LONG = 60, '60 Dakika'
        VERY_LONG = 90, '90 Dakika'

    class VerificationStatus(models.TextChoices):
        PENDING = 'Pending', 'Beklemede'
        ACCEPTED = 'Accepted', 'Onaylandı'
        REJECTED = 'Rejected', 'Reddedildi'

    class Title(models.TextChoices):
        DIETICIAN = 'DIETICIAN', 'Diyetisyen'
        EXPERT_DIETICIAN = 'EXPERT_DIETICIAN', 'Uzman Diyetisyen'
        INTERN_DIETICIAN = 'INTERN_DIETICIAN', 'Stajyer Diyetisyen'


    tc_no = models.CharField(max_length=11, unique=True)
    tc_verified = models.BooleanField(default=False)
    license_number = models.CharField(max_length=50, blank=True)
    license_document = models.FileField(upload_to='licenses/%Y/%m/%d/', blank=True)
    biography = models.TextField(blank=True)
    profile_photo = models.ImageField(upload_to='dietician_profile_photos/', blank=True)

    title = models.CharField(
        max_length=20,
        choices=Title.choices,
        blank=True)

    verification_status = models.CharField(
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
        max_length=20,
    )

    appointment_duration = models.IntegerField(
        choices=AppointmentDuration.choices,
        default=AppointmentDuration.SHORT,
    )

    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Diyetisyen Profili'
        verbose_name_plural = 'Diyetisyen Profilleri'

    def __str__(self):
        return f"{self.full_name} - {self.verification_status}"

    @property
    def is_accepted(self):
        return self.verification_status == self.VerificationStatus.ACCEPTED

    def save(self, *args, **kwargs):
        self.role = User.Role.DIETICIAN
        super().save(*args, **kwargs)

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if not reviews.exists():
            return 0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)

    @property
    def review_count(self):
        return self.reviews.count()


