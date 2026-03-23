from typing import Optional
from apps.foods.models import Food
from .local_service import LocalFoodService
from .openfoodfacts import OpenFoodFactsService
from .usda import USDAService
from .translation import TranslationService


class FoodService:
    def __init__(self):
        self.local = LocalFoodService()
        self.off = OpenFoodFactsService()
        self.usda = USDAService()
        self.translator = TranslationService()

    def search(self, query: str) -> list[Food]:
        results: list[Food] = []

        def _merge(items: list[Food]) -> None:
            existing_ids = {f.external_id for f in results if getattr(f, 'external_id', None)}
            for item in items:
                ext_id = getattr(item, 'external_id', None)
                if ext_id and ext_id in existing_ids:
                    continue
                results.append(item)
                if ext_id:
                    existing_ids.add(ext_id)

        local_results = self.local.search(query)
        if local_results:
            _merge(local_results)
        english_query = self.translator.translate(query, source='tr', target='en')
        if english_query != query:
            local_results_en = self.local.search(english_query)
            if local_results_en:
                _merge(local_results_en)

        off_results = self.off.search(query)
        if off_results:
            _merge(self._save_and_return(off_results))
        if english_query != query:
            off_results_en = self.off.search(english_query)
            if off_results_en:
                _merge(self._save_and_return(off_results_en))

        usda_results = self.usda.search(english_query)
        if usda_results:
            _merge(self._save_and_return(usda_results))

        return results

    def get_by_barcode(self, barcode: str) -> Optional[Food]:
        local = self.local.get_by_barcode(barcode)
        if local:
            return local

        off_result = self.off.get_by_barcode(barcode)
        if off_result:
            saved = self._save_and_return([off_result])
            return saved[0] if saved else None

        return None

    def _save_and_return(self, items: list[dict], original_query: str = '', english_query: str = '') -> list[Food]:
        saved = []
        for item in items:
            if not item.get('external_id'):
                continue

            if not item.get('name_tr') and item.get('name'):
                item['name_tr'] = self.translator.translate(item['name'], source='en', target='tr')

            if not item.get('name') and english_query:
                item['name'] = english_query
            try:
                food, _ = Food.objects.get_or_create(
                    external_id=item['external_id'],
                    defaults=item
                )
                saved.append(food)
            except Exception:
                continue
        return saved
