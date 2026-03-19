from django.contrib import admin

from apps.diets.models import Meal, DailyPlan, WeeklyPlan, DietPlan, MealItem
from apps.diets.models.assignment import DieticianAssignment


@admin.register(DietPlan)
class DietPlanAdmin(admin.ModelAdmin):
    list_display = ("status", "client", "dietician")
    exclude = ("dietician", "status", "daily_calories", "daily_protein", "daily_carbs", "daily_fat", "daily_water", "goal" )

@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    list_display = ("daily_plan", "meal_type")

@admin.register(WeeklyPlan)
class WeeklyPlanAdmin(admin.ModelAdmin):
    list_display = ("start_date", "end_date")

@admin.register(DieticianAssignment)
class DieticianAssignmentAdmin(admin.ModelAdmin):
    list_display = ("client", "dietician", "status")

@admin.register(DailyPlan)
class DailyPlanAdmin(admin.ModelAdmin):
    list_display = ("weekly_plan", "day")

@admin.register(MealItem)
class MealItemAdmin(admin.ModelAdmin):
    list_display = ("meal",)

