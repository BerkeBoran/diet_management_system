from django.db import transaction
from rest_framework import serializers

from apps.users.models import User, Dietician, Client


class DieticianRegisterSerializer(serializers.Serializer):

    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm  = serializers.CharField(write_only=True)

    tc_no = serializers.CharField(max_length=11, min_length=11)
    license_number  = serializers.CharField(max_length=50)
    age = serializers.IntegerField(min_value=18, max_value=100)
    title  = serializers.ChoiceField(choices=Dietician.Title.choices)
    biography = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    license_document = serializers.FileField()
    profile_photo = serializers.ImageField()
    work_time_start = serializers.TimeField(required=False, allow_null=True)
    work_time_end = serializers.TimeField(required=False, allow_null=True)


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

        # 1. User oluştur (is_active=False → e-posta doğrulanınca aktif olur)
        dietician = Dietician(
            email = data["email"],
            password  = data["password"],
            first_name = data["first_name"],
            last_name  = data["last_name"],
            phone_number = data["phone_number"],
            role = User.Role.DIETICIAN,
            is_active  = False,

            tc_no = data["tc_no"],
            license_number  = data["license_number"],
            age = data["age"],
            title = data["title"],
            biography  = data.get("biography", ""),
            license_document = data["license_document"],
            profile_photo = data.get("profile_photo", None),
            work_time_start = data.get("work_time_start", None),
            work_time_end = data.get("work_time_end", None),
        )

        dietician.set_password(data["password"])
        dietician.save()

        return dietician

class ClientRegisterSerializer(serializers.Serializer):

    first_name = serializers.CharField(max_length=150)
    last_name  = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    gender = serializers.ChoiceField(choices=Client.Gender.choices)
    age = serializers.IntegerField(min_value=1, max_value=120)
    height = serializers.IntegerField(min_value=50, max_value=300)
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=1)
    allergies = serializers.JSONField(default=list)
    chronic_conditions = serializers.JSONField(default=list)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu e-posta adresi zaten kayıtlı.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Şifreler eşleşmiyor."})
        return attrs

    @transaction.atomic
    def save(self):
        data = self.validated_data

        client = Client(
            email = data["email"],
            password = data["password"],
            first_name = data["first_name"],
            last_name = data["last_name"],
            phone_number = data["phone_number"],
            role = User.Role.CLIENT,
            is_active = False,

            gender = data["gender"],
            age = data["age"],
            height = data["height"],
            weight = data["weight"],
            allergies = data.get("allergies", []),
            chronic_conditions = data.get("chronic_conditions", []),
        )

        client.set_password(data["password"])
        client.save()

        return client
