import os
from typing import Optional
from .base import BaseFoodService
from .translation import TranslationService

class USDAService(BaseFoodService):

    BASE_URL = 'https://api.nal.usda.gov/fdc/v1'
    API_KEY = os.environ.get('USDA_API_KEY', '')

    def __init__(self):
        super().__init__(self.BASE_URL)
        self.translator = TranslationService()

    def search(self, query: str) -> list[dict]:
        if not self.API_KEY:
            return []

        url = "/foods/search"
        params = {
            'query': query,
            'api_key': self.API_KEY,
            'pageSize': 10,
            'dataType': 'Foundation,SR Legacy',
        }

        data = self._make_request('GET', url, params=params )
        if not data:
            return []
        foods = data.get('foods', [])
        return [parsed for f in foods if (parsed := self._parse(f)) is not None]

    def get_by_barcode(self, barcode: str) -> Optional[dict]:
        return None

    def _parse(self, product: dict) -> Optional[dict]:
        desc = product.get('description', 'İsimsiz Ürün')

        nutrients = {
            n.get('nutrientName'): n.get('value')
            for n in product.get('foodNutrients', [])
        }

        cal_options = [
            nutrients.get('Energy'),
            nutrients.get('Energy (Atwater General Factors)'),
            nutrients.get('Energy (Atwater Specific Factors)'),
            nutrients.get('Energy', 0)
        ]
        calories = next((c for c in cal_options if c is not None), 0)


        english_name = desc
        name_tr = self.translator.translate(english_name, source='en', target='tr')

        try:
            data = {
                'name': english_name.capitalize(),
                'name_tr': name_tr.capitalize(),
                'barcode': None,
                'external_id': f"usda_{product.get('fdcId', '')}",
                'source': 'USDA',
                'calories': float(calories),
                'proteins': float(nutrients.get('Protein', 0)),
                'carbs': float(nutrients.get('Carbohydrate, by difference', 0)),
                'fat': float(nutrients.get('Total lipid (fat)', 0)),
                'fiber': float(nutrients.get('Fiber, total dietary', 0)),
                'sugar': float(nutrients.get('Sugars, total including NLEA', 0) or nutrients.get('Total Sugars', 0)),
                'sodium': float(nutrients.get('Sodium, Na', 0) or 0) / 1000,
                'image_url': '',
                'is_verified': True,
            }
            return data
        except Exception as e:
            print(f"ERROR: Paketleme hatası: {e}")
            return None