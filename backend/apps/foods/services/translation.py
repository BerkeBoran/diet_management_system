import os
import logging
from typing import Optional
from .base import BaseFoodService

logger = logging.getLogger(__name__)


class TranslationService(BaseFoodService):
    def search(self, query: str):
        pass

    def get_by_barcode(self, barcode: str):
        pass

    def __init__(self):
        base_url = os.environ.get('LIBRETRANSLATE_URL', 'http://libretranslate:5000')
        super().__init__(base_url=base_url)

    def translate(self, text: str, source: str = 'auto', target: str = 'tr') -> str:
        if not text:
            return ""

        cached_result = self._get_from_db(text, source, target)
        if cached_result:
            return cached_result

        payload = {
            "q": text,
            "source": source,
            "target": target,
            "format": "text"
        }

        data = self._make_request('POST', 'translate', json=payload)

        translated_text = data.get("translatedText", text) if data else text

        if translated_text and translated_text != text:
            self._save_to_db(text, translated_text, source)

        return translated_text

    def _get_from_db(self, query: str, source: str, target: str) -> Optional[str]:
        from apps.foods.models.food_translation import FoodTranslation
        try:
            if source == 'tr':
                obj = FoodTranslation.objects.get(turkish__iexact=query)
                return obj.english
            else:
                obj = FoodTranslation.objects.get(english__iexact=query)
                return obj.turkish
        except FoodTranslation.DoesNotExist:
            return None

    def _save_to_db(self, original: str, translated: str, source: str) -> None:
        from apps.foods.models.food_translation import FoodTranslation
        try:
            turkish = original if source == 'tr' else translated
            english = translated if source == 'tr' else original

            FoodTranslation.objects.get_or_create(
                turkish=turkish.lower().strip(),
                defaults={'english': english.lower().strip()}
            )
        except Exception as e:
            logger.error(f"Çeviri DB'ye kaydedilirken hata: {e}")

    def is_turkish(self, query: str) -> bool:
        turkish_chars = set('çğışöüÇĞİŞÖÜ')
        if any(c in turkish_chars for c in query):
            return True
        from apps.foods.models.food_translation import FoodTranslation
        return FoodTranslation.objects.filter(turkish__iexact=query).exists()