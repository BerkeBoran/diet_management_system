from pydantic import BaseModel, Field

class MealSchema(BaseModel):
    day: str = Field(description="Öğünün günü (Örn: Pazartesi, Salı, Her Gün)")
    meal_type: str = Field(description="Öğün tipi (Örn: Kahvaltı, Ara Öğün, Öğle Yemeği, Akşam Yemeği)")
    contents: str = Field(description="Öğünün içeriği ve porsiyonu (Örn: 2 haşlanmış yumurta, 30gr yulaf)")
    calories: int = Field(description="Bu öğünün tahmini toplam kalorisi")

class DietResponse(BaseModel):
    meals: list[MealSchema] = Field(description="Diyet listesindeki tüm öğünlerin detaylı listesi")

    content: str = Field(description="Tüm diyetin kullanıcıya gösterilecek şık, okunabilir Markdown formatı")
    summary: str = Field(description="Diyetin 100 karakterlik kısa özeti")
