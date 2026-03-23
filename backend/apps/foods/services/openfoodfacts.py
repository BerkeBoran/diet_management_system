from typing import Optional
from .base import BaseFoodService
from .translation import TranslationService


class OpenFoodFactsService(BaseFoodService):

    BASE_URL = 'https://world.openfoodfacts.org'

    def __init__(self):
        super().__init__(self.BASE_URL)
        self.translator = TranslationService()

    def search(self, query: str) -> list[dict]:
        url = "/cgi/search.pl"
        params = {
            'search_terms': query,
            'action': 'process',
            'json': 1,
            'page_size': 10,
            'lc': 'tr',
        }
        data = self._make_request('GET', url, params=params)
        if not data:
            return []

        products = data.get('products', [])
        return [parsed for p in products if (parsed := self._parse(p)) is not None]

    def get_by_barcode(self, barcode: str) -> Optional[dict]:
        url = f"/api/v0/product/{barcode}.json"
        data = self._make_request('GET', url)
        if not data or data.get('status') != 1:
            return None
        return self._parse(data['product'])

    def _parse(self, product: dict) -> Optional[dict]:
        nutrients = product.get('nutriments', {})
        if not nutrients.get('energy-kcal_100g'):
            return None

        name = product.get('product_name', '')
        if not name:
            return None

        return {
            'name': name,
            'name_tr': product.get('product_name_tr', '') or self.translator.translate(name, source='en', target='tr'),
            'barcode': product.get('code') or None,
            'external_id': f"off_{product.get('_id', '')}",
            'source': 'OPENFOODFACTS',
            'calories': nutrients.get('energy-kcal_100g', 0),
            'proteins': nutrients.get('proteins_100g', 0),
            'carbs': nutrients.get('carbohydrates_100g', 0),
            'fat': nutrients.get('fat_100g', 0),
            'fiber': nutrients.get('fiber_100g', 0),
            'sugar': nutrients.get('sugars_100g', 0),
            'sodium': nutrients.get('sodium_100g', 0),
            'image_url': product.get('image_url', ''),
            'is_verified': False,
        }
