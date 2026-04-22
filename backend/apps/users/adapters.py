from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):

    def get_email_confirmation_url(self, request, emailconfirmation):
        key = emailconfirmation.key
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        return f"{frontend_url}/verify-email/{key}/"

    def save_user(self, request, user, form, commit=True):
        user = super().save_user(request, user, form, commit=False)
        data = form.cleaned_data
        user.role = data.get("role", "client")
        if commit:
            user.save()
        return user


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):

    def is_open_for_signup(self, request, sociallogin):
        return True

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)

        if not user.role:
            user.role = "client"

        if sociallogin.account.provider == "apple":
            extra = sociallogin.account.extra_data
            name  = extra.get("name", {})
            if name and not user.first_name:
                user.first_name = name.get("firstName", "")
                user.last_name  = name.get("lastName", "")

        user.is_active = True
        user.save()

        from .models import Client
        Client.objects.get_or_create(
            user=user,
            defaults={"gender": "other", "age": 0, "height_cm": 0, "weight_kg": 0},
        )

        return user