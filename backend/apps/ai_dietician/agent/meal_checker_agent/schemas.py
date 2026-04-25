from pydantic import BaseModel, Field


class FoodItem(BaseModel):
    name: str = Field(description="Yiyeceğin ismi")
    portion: str = Field(description="Tahmini porsiyon, örn: '150g', '1 kase', '2 dilim'")
    calories: int = Field(description="Tahmini kalori")


class VisionAnalysis(BaseModel):
    foods: list[FoodItem] = Field(description="Fotoğrafta bulunan her yiyecek")
    total_calories: int = Field(description="Tahmini toplam kalori")
    is_food: bool = Field(description="Görselde gerçekten bir yemek var mı? Eğer görsel yemek değilse (araba, manzara vs.) false dön.")