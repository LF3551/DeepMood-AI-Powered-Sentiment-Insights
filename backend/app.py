from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DeepMood API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация модели с многоязычной моделью
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="nlptown/bert-base-multilingual-uncased-sentiment",
    return_all_scores=True
)

class TextInput(BaseModel):
    text: str

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_sentiment(input_data: TextInput):
    try:
        if not input_data.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
            
        # Получаем все оценки
        results = sentiment_analyzer(input_data.text)[0]
        
        # Находим оценку с максимальным значением
        max_score = max(results, key=lambda x: x['score'])
        
        # Определяем тональность на основе метки
        sentiment_mapping = {
            '1 star': 'negative',
            '2 stars': 'negative',
            '3 stars': 'neutral',
            '4 stars': 'positive',
            '5 stars': 'positive'
        }
        
        sentiment = sentiment_mapping.get(max_score['label'], 'neutral')
        
        # Нормализуем оценку для разных тональностей
        normalized_score = max_score['score']
        if sentiment == 'neutral':
            # Для нейтральной тональности уменьшаем уверенность
            normalized_score *= 0.7
        
        return {
            "text": input_data.text,
            "sentiment": sentiment,
            "score": round(normalized_score, 3),
            "details": {
                "original_label": max_score['label'],
                "all_scores": [
                    {
                        "label": score['label'],
                        "score": round(score['score'], 3)
                    } for score in results
                ]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Analysis failed: {str(e)}"
        )

@app.get("/info")
async def get_model_info():
    """Получение информации о модели"""
    return {
        "model": "bert-base-multilingual-uncased-sentiment",
        "languages": ["Russian", "English", "Spanish", "French", "German", "Italian"],
        "version": "1.0.0"
    }