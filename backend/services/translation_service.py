from deep_translator import GoogleTranslator
import logging

logger = logging.getLogger("LegalLens")

class TranslationService:
    def __init__(self):
        # GoogleTranslator doesn't require an API key for basic usage
        pass
        
    def translate(self, text: str, target_lang: str, source_lang: str = 'en'):
        if target_lang == source_lang or target_lang == 'en':
            return text
            
        try:
            translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text)
            return translated
        except Exception as e:
            logger.error(f"Translation error: {e}. Returning original text.")
            return text

translation_service = TranslationService()
