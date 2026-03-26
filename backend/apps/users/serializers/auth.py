from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.users.models import Dietician


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['full_name'] = user.full_name

        return token

    def validate(self, attrs):
        request = self.context.get('request')
        requested_role = request.data.get('role') if request else None

        data = super().validate(attrs)

        if requested_role:
            if self.user.role.upper() != requested_role.upper():
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied({
                    "detail": "Seçtiğiniz rol ile hesabınız eşleşmiyor!"
                })

        if self.user.role.upper() == 'DIETICIAN':
            try:
                dietician_profile = self.user.dietician

                if dietician_profile.verification_status != Dietician.VerificationStatus.ACCEPTED:
                    from rest_framework.exceptions import PermissionDenied
                    if dietician_profile.verification_status == Dietician.VerificationStatus.PENDING:
                        raise PermissionDenied({
                        "detail": "Hesabınız değerlendirme sürecindedir en kısa sürede geri dönüş yapacağız."
                         })
                    if dietician_profile.verification_status == Dietician.VerificationStatus.REJECTED:
                        raise PermissionDenied({
                            "detail": "Hesabınız diyetisyen hesabı için yeterli bulunmamış ve reddedilmiştir."
                        })

            except Dietician.DoesNotExist:

                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied({
                    "detail": "Diyetisyen profili bulunamadı."
                })

            return data

        data['email'] = self.user.email
        data['full_name'] = self.user.full_name
        data['role'] = self.user.role
        data['user_id'] = self.user.id

        return data