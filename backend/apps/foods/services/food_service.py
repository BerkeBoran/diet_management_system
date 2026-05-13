from apps.foods.models import Food
from .local_service import LocalFoodService
from .fatsecret import FatSecretService


class FoodService:
    def __init__(self):
        self.local = LocalFoodService()
        self.api = FatSecretService()

    def search(self, query):

        local_results = self.local.search(query)

        if local_results:
            return local_results

        api_results = self.api.search(query, max_results=5)

        saved_foods = []

        for item in api_results:
            food_obj, created = Food.objects.get_or_create(
                external_id=item["external_id"],
                defaults={
                    "name": item["name"],
                    "source": item["source"],
                    "serving_description": item["serving_description"],
                    "calories": item.get("calories", 0.0),
                    "protein": item.get("protein", 0.0),
                    "fat": item.get("fat", 0.0),
                    "carbs": item.get("carbs", 0.0),
                    "saturated_fat": item.get("saturated_fat", 0.0),
                    "sugar": item.get("sugar", 0.0),
                    "sodium": item.get("sodium", 0.0),
                    "is_verified": item.get("is_verified", True)
                }
            )
            saved_foods.append(food_obj)

        return saved_foods
