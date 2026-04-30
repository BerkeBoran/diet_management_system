from pydantic import ValidationError

from .base import User
from django.db import models


class Dietician(User):

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

    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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


    class Meta:
        verbose_name = 'Diyetisyen Profili'
        verbose_name_plural = 'Diyetisyen Profilleri'

class DieticianSchedule(models.Model):

    class AppointmentDuration(models.IntegerChoices):
        SHORT = 30, '30 Dakika'
        MEDIUM = 45, '45 Dakika'
        LONG = 60, '60 Dakika'
        VERY_LONG = 90, '90 Dakika'

    dietician = models.OneToOneField(Dietician, on_delete=models.CASCADE)
    work_time_start = models.TimeField()
    work_time_end = models.TimeField()
    weekend_workings = models.BooleanField(default=False)
    weekend_work_time_start = models.TimeField(null=True, blank=True,)
    weekend_work_time_end = models.TimeField(null=True, blank=True,)

    appointment_duration = models.IntegerField(
        choices=AppointmentDuration.choices,
        default=AppointmentDuration.SHORT,
    )

    def clean(self):

        if self.weekend_workings:
            if not self.weekend_work_time_start or not self.weekend_work_time_end:
                raise ValidationError("Hafta sonu çalışıyorsanız, mesai saatlerini girmelisiniz.")

            if self.weekend_work_time_start >= self.weekend_work_time_end:
                raise ValidationError("Hafta sonu mesai başlangıç saati bitiş saatinden önce olmalıdır")

        else:
            self.weekend_work_time_start = None
            self.weekend_work_time_end = None


        if self.work_time_start >= self.work_time_end:
            raise ValidationError("Mesai saatinizin başlangıcı bitişinden önce olmalıdır.")


    def save(self, *args, **kwargs):
       self.full_clean()
       super().save(*args, **kwargs)
