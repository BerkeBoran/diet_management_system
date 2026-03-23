from typing import Optional
from apps.foods.models import Food
from .base import BaseFoodService


class LocalFoodService(BaseFoodService):
    def __init__(self):
        super().__init__(base_url='local://internal')

    def search(self, query: str) -> list:
        results = Food.objects.filter(
            name_tr__icontains=query
        ) | Food.objects.filter(
            name__icontains=query
        )
        return list(results)

    def get_by_barcode(self, barcode: str) -> Optional[Food]:
        try:
            return Food.objects.get(barcode=barcode)
        except Food.DoesNotExist:
            return None