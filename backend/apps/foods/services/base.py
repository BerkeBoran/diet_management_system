from abc import ABC, abstractmethod
from typing import Optional, Any
import logging
import requests

logger = logging.getLogger(__name__)

class BaseFoodService(ABC):

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Optional[Any]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        kwargs.setdefault('timeout', 10)

        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API Hatası ({url}): {str(e)}")
            return None

    @abstractmethod
    def search(self, query: str) -> list[dict]:
        pass

    @abstractmethod
    def get_by_barcode(self, barcode: str) -> Optional[dict]:
        pass