from django.contrib import admin

from apps.users.models import User, Client, Dietician


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone_number", "role", "id")
    exclude = ("is_staff", "is_superuser", "is_active", "user_permissions", "groups", "last_login", "date_joined",)

@admin.register(Dietician)
class DieticianAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone_number", "title")
    exclude = ("last_login", "date_joined","is_staff", "is_superuser", "is_active", "user_permissions","groups","role", "verified_at", "rejection_reason","tc_verified")
