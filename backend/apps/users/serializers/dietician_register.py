from django.db import transaction
from rest_framework import serializers

from apps.users.models import Dietician, User
from apps.users.models.dietician import DieticianSchedule


class DieticianScheduleSerializer(serializers.Serializer):
    weekend_workings = serializers.BooleanField()
    weekend_work_time_start = serializers.TimeField()
    weekend_work_time_end = serializers.TimeField()
    work_time_start = serializers.TimeField()
    work_time_end = serializers.TimeField()
    appointment_duration = serializers.ChoiceField(choices=DieticianSchedule.AppointmentDuration.choices)

    class Meta:
        model = DieticianSchedule
        fields = ['work_time_start', 'work_time_end', 'appointment_duration', 'weekend_workings', 'weekend_work_time_start', 'weekend_work_time_end']

    def validate(self, attrs):
        work_time_start = attrs.get('work_time_start')
        work_time_end = attrs.get('work_time_end')
        weekend_workings = attrs.get('weekend_workings')
        weekend_work_time_start = attrs.get('weekend_work_time_start')
        weekend_work_time_end = attrs.get('weekend_work_time_end')
        appointment_duration = attrs.get('appointment_duration')

        return attrs


class DieticianRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    tc_no = serializers.CharField(max_length=11, min_length=11)
    license_number = serializers.CharField(max_length=50)
    age = serializers.IntegerField(min_value=18, max_value=100)
    title = serializers.ChoiceField(choices=Dietician.Title.choices)
    biography = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    license_document = serializers.FileField()
    profile_photo = serializers.ImageField()

    schedule = DieticianScheduleSerializer(required=True)


    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu e-posta adresi zaten kayıtlı.")
        return value

    def validate_tc_no(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("TC kimlik no yalnızca rakamlardan oluşmalıdır.")
        if Dietician.objects.filter(tc_no=value).exists():
            raise serializers.ValidationError("Bu TC kimlik no zaten kayıtlı.")
        return value

    def validate_license_no(self, value):
        if Dietician.objects.filter(license_no=value).exists():
            raise serializers.ValidationError("Bu lisans numarası zaten kayıtlı.")
        return value

    def validate_certificate(self, value):
        allowed_types = ["application/pdf", "image/jpeg", "image/png"]
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Yalnızca PDF, JPG veya PNG yüklenebilir.")
        max_size = 5 * 1024 * 1024  # 5 MB
        if value.size > max_size:
            raise serializers.ValidationError("Dosya boyutu 5 MB'ı geçemez.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Şifreler eşleşmiyor."})
        return attrs

    @transaction.atomic
    def save(self):
        data = self.validated_data
        schedule_data = data.pop("schedule")

        dietician = Dietician(
            email=data["email"],
            password=data["password"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone_number=data["phone_number"],
            role=User.Role.DIETICIAN,
            is_active=False,

            tc_no=data["tc_no"],
            license_number=data["license_number"],
            age=data["age"],
            title=data["title"],
            biography=data.get("biography", ""),
            license_document=data["license_document"],
            profile_photo=data.get("profile_photo", None),
        )

        dietician.set_password(data["password"])
        dietician.save()

        DieticianSchedule.objects.create(dietician=dietician, **schedule_data)

        return dietician



