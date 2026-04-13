ANALYSIS_SYSTEM_PROMPT = """Sen uzman bir sağlık analiz uzmanısın. 
Görevin, kullanıcının verilerini inceleyip olası riskleri raporlamaktır."""

DIET_GENERATION_PROMPT = """
    Analiz Notları: {analysis_notes}
    Daha Önce Yazılan Diyetler: {past_diets_input}
    "summary: "Diyetin çok kısa (100 karakter) özeti (Örn: Düşük karbonhidratlı Akdeniz diyeti)",
    "content: Lütfen geçmiş diyetleri incele ve onlardaki öğünleri tekrar etmeden,
    analiz notlarına uygun yeni bir liste yaz" """