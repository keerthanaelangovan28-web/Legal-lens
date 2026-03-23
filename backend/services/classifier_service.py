from transformers import pipeline
import torch

# Load model on startup
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    model_loaded = True
except Exception as e:
    print(f"Failed to load Classifier model: {e}. Using mock classification.")
    model_loaded = False

CRISIS_LABELS = ["police_detention", "domestic_violence", "eviction", "salary_theft", "consumer_fraud", "other"]

HYPOTHESIS_TEMPLATES = {
    "police_detention": "This person is being detained or arrested by police",
    "domestic_violence": "This person is facing violence or threats at home from family",
    "eviction": "This person is being forced out of their home or rental property",
    "salary_theft": "This person's employer is not paying their wages or salary",
    "consumer_fraud": "This person has been cheated in a financial or consumer transaction",
    "other": "This is a general query or unrelated situation"
}

def classify_crisis(text: str) -> dict:
    if not model_loaded:
        # Simple keyword-based mock classification
        text_lower = text.lower()
        if "police" in text_lower or "arrest" in text_lower or "detain" in text_lower:
            return {"crisis_type": "police_detention", "confidence": 0.9}
        elif "husband" in text_lower or "violence" in text_lower or "beat" in text_lower:
            return {"crisis_type": "domestic_violence", "confidence": 0.9}
        elif "landlord" in text_lower or "evict" in text_lower or "rent" in text_lower:
            return {"crisis_type": "eviction", "confidence": 0.9}
        elif "salary" in text_lower or "wage" in text_lower or "pay" in text_lower:
            return {"crisis_type": "salary_theft", "confidence": 0.9}
        elif "fraud" in text_lower or "cheat" in text_lower or "bank" in text_lower:
            return {"crisis_type": "consumer_fraud", "confidence": 0.9}
        else:
            return {"crisis_type": "other", "confidence": 0.5}
    
    candidate_labels = list(HYPOTHESIS_TEMPLATES.keys())
    
    # Using the hypothesis templates as the labels for better zero-shot performance
    # or passing them as the hypothesis_template parameter
    result = classifier(text, candidate_labels, hypothesis_template="This text is about {}.")
    
    top_label = result['labels'][0]
    top_score = result['scores'][0]
    
    all_scores = dict(zip(result['labels'], result['scores']))
    
    if top_score < 0.45:
        return {
            "crisis_type": "other",
            "confidence": top_score,
            "all_scores": all_scores
        }
        
    return {
        "crisis_type": top_label,
        "confidence": top_score,
        "all_scores": all_scores
    }
