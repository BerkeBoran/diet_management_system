from dj_rest_auth.serializers import PasswordResetSerializer as BasePasswordResetSerializer, UserDetailsSerializer
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.users.models import Dietician, Client, User


class DieticianProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Dietician
        fields = [
            "tc_no", "license_number", "title",
            "biography", "license_document", "is_verified",
        ]
        read_only_fields = ["is_verified"]


class ClientProfileSerializer(serializers.ModelSerializer):
    bmi = serializers.ReadOnlyField()

    class Meta:
        model  = Client
        fields = ["gender", "age", "height", "weight"]


class CustomUserDetailsSerializer(serializers.ModelSerializer):
    dietician_profile = DieticianProfileSerializer(read_only=True)
    client_profile    = ClientProfileSerializer(read_only=True)

    class Meta:
        model  = User
        fields = [
            "pk", "email", "first_name", "last_name",
            "phone", "role", "dietician_profile", "client_profile",
        ]
        read_only_fields = ["email", "role"]

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        request = self.context.get("request")
        requested_role = request.data.get("role") if request else None

        data = super().validate(attrs)

        if requested_role and self.user.role.upper() != requested_role.upper():
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied({
                "detail": "Sectiginiz rol ile hesabin eslesmiyor!"
            })

        if self.user.role.upper() == "DIETICIAN":
            try:
                dietician_profile = self.user.dietician
            except Dietician.DoesNotExist:
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied({
                    "detail": "Diyetisyen profili bulunamadi."
                })

            if dietician_profile.verification_status != Dietician.VerificationStatus.ACCEPTED:
                from rest_framework.exceptions import PermissionDenied

                if dietician_profile.verification_status == Dietician.VerificationStatus.PENDING:
                    raise PermissionDenied({
                        "detail": "Hesabiniz degerlendirme surecindedir."
                    })
                if dietician_profile.verification_status == Dietician.VerificationStatus.REJECTED:
                    raise PermissionDenied({
                        "detail": "Diyetisyen hesabi basvurunuz reddedildi."
                    })

            return data

        data["email"] = self.user.email
        data["full_name"] = self.user.full_name
        data["role"] = self.user.role
        data["user_id"] = self.user.id
        return data


class CustomPasswordResetSerializer(BasePasswordResetSerializer):
    def get_email_options(self):
        from django.conf import settings

        return {
            "subject_template_name": "registration/password_reset_subject.txt",
            "email_template_name": "registration/password_reset_email.html",
            "extra_email_context": {
                "frontend_url": settings.FRONTEND_URL,
            },
        }
