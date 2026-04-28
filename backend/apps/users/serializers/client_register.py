from django.db import transaction
from rest_framework import serializers

from apps.users.models import Client, User


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
