"""Besin arama servisi.

Veriler tamamen lokal veritabanından (`Food` tablosu) gelir. Daha önce
fallback olarak çağrılan FatSecret API entegrasyonu devre dışı bırakıldı —
veritabanı `import_besinler` komutuyla doldurulur, arama yalnız o veriyi kullanır.
"""

from .local_service import LocalFoodService


class FoodService:
    def __init__(self):
        self.local = LocalFoodService()

    def search(self, query):
        """Yerel veritabanında 'name' içinde 'query' geçen besinleri döner."""
        return self.local.search(query)
