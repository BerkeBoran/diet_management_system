import requests
from django.conf import settings
from django.core.cache import cache


class FatSecretService:
    BASE_URL = "https://platform.fatsecret.com/rest/server.api"
    TOKEN_URL = "https://oauth.fatsecret.com/connect/token"

    def __init__(self):
        self.client_id = settings.FATSECRET_CLIENT_ID
        self.client_secret = settings.FATSECRET_CLIENT_SECRET

    def _get_access_token(self):
        token = cache.get("fatsecret_access_token")
        if token:
            return token

        data = {
            "grant_type": "client_credentials",
            "scope": "basic",
        }

        response = requests.post(
            self.TOKEN_URL,
            data=data,
            auth=(self.client_id, self.client_secret),
        )

        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 86400)

            cache.set("fatsecret_access_token", token, timeout=expires_in - 300)
            return token

        return None

    def _get_headers(self):
        token = self._get_access_token()
        if not token:
            return {}
        return {
            "Authorization": f"Bearer {token}",
        }

    def search(self, query, max_results=5):
        params = {
            "method": "foods.search.v1",
            "search_expression": query,
            "format": "json",
            "max_results": max_results,
            "region": "TR",
            "language": "tr",
        }
        response = requests.post(self.BASE_URL, params=params, headers=self._get_headers())
        if response.status_code != 200:
            return []

        data = response.json()
        foods_data = data.get("foods", {}).get("food", [])
        if isinstance(foods_data, dict):
            foods_data = [foods_data]

        results = []
        for item in foods_data:
            food_id = item.get("food_id")
            if food_id:
                detail = self._get_food_detail(food_id)
                if detail:
                    results.append(detail)

        return results

    def _get_food_detail(self, food_id):
        params = {
            "method": "food.get.v5",
            "food_id": food_id,
            "format": "json",
        }
        response = requests.post(self.BASE_URL, params=params, headers=self._get_headers())

        if response.status_code != 200:
            return None

        data = response.json().get("food", {})
        if not data:
            return None

        servings = data.get("servings", {}).get("serving", [])
        if isinstance(servings, dict):
            servings = [servings]

        target_serving = servings[0] if servings else None
        for s in servings:
            if str(s.get("is_default", "0")) == "1":
                target_serving = s
                break

        if not target_serving:
            return None

        return {
            "name": data.get("food_name", ""),
            "external_id": f"fatsecret_{data.get('food_id')}",
            "source": "FATSECRET",
            "serving_description": target_serving.get("serving_description", "1 porsiyon"),
            "calories": float(target_serving.get("calories", 0) or 0),
            "protein": float(target_serving.get("protein", 0) or 0),
            "fat": float(target_serving.get("fat", 0) or 0),
            "carbs": float(target_serving.get("carbohydrate", 0) or 0),
            "sodium": float(target_serving.get("sodium", 0) or 0),
            "saturated_fat": float(target_serving.get("saturated_fat", 0) or 0),
            "is_verified": True,
        }
