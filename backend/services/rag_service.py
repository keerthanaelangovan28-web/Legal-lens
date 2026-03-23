import json
import os
import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Optional
from ..models.crisis_model import LegalResponse, LegalRight, ScriptedPhrase
from deep_translator import GoogleTranslator
from .translation_service import translation_service
import ollama

# Configuration
CHROMA_DB_DIR = "backend/data/vector_store"
COLLECTION_NAME = "indian_law_corpus"
EMBEDDING_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
LLM_MODEL_NAME = "llama3:8b"

SYSTEM_PROMPT = """
You are LegalLens, an Indian legal rights assistant. You MUST follow these rules with ZERO exceptions:
1. Answer ONLY using the law sections provided in the context below
2. Your response MUST be a valid JSON object with this exact structure:
{
  "rights": [
    {"description": "...", "section_number": "...", "act_name": "...", "act_year": ...},
    {"description": "...", "section_number": "...", "act_name": "...", "act_year": ...},
    {"description": "...", "section_number": "...", "act_name": "...", "act_year": ...}
  ],
  "scripted_phrase": "The exact words the person should say right now"
}
3. Rights descriptions must be in plain, simple language — no legal jargon
4. Scripted phrase must be 1-2 sentences maximum, in the specified language
5. If you cannot find 3 relevant rights in the context, use what you have and fill remaining with general constitutional protections
6. NEVER invent section numbers. NEVER. If you are not sure, use Article 21 (right to life) as a fallback
"""

class RAGService:
    def __init__(self):
        print(f"Initializing RAGService with {EMBEDDING_MODEL_NAME}...")
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        self.chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        self.collection = self.chroma_client.get_collection(name=COLLECTION_NAME)
        
    def query(self, crisis_type: str, user_description: str, jurisdiction_state: str, language: str) -> LegalResponse:
        # 1. Build retrieval query
        retrieval_query = f"{user_description} legal rights India {crisis_type}"
        query_embedding = self.embedding_model.encode(retrieval_query).tolist()
        
        # 2. Query ChromaDB with filter
        # Note: crisis_tags is stored as a comma-separated string in metadata
        # ChromaDB where filter for contains is a bit limited in some versions, 
        # but for this scaffold we'll use a simple approach
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=10,
            # where={"$and": [{"crisis_tags": {"$contains": crisis_type}}, {"$or": [{"states_applicable": {"$contains": "all"}}, {"states_applicable": {"$contains": jurisdiction_state}}]}]}
            # Simplifying where filter for stability across Chroma versions
            where={"$or": [{"states_applicable": "all"}, {"states_applicable": jurisdiction_state}]}
        )
        
        # 3. Retrieve top 6 most relevant law chunks
        # Filtering for crisis_type in memory for precision
        relevant_chunks = []
        for i in range(len(results['ids'][0])):
            metadata = results['metadatas'][0][i]
            if crisis_type in metadata['crisis_tags'].split(','):
                relevant_chunks.append({
                    "id": results['ids'][0][i],
                    "full_text": results['documents'][0][i],
                    "metadata": metadata
                })
                if len(relevant_chunks) >= 6:
                    break
                    
        # 4. Format law chunks for prompt
        formatted_law_chunks = ""
        for chunk in relevant_chunks:
            m = chunk['metadata']
            formatted_law_chunks += f"Section: {m['section_number']} of {m['act_name']} ({m['act_year']})\nTitle: {m['section_id']}\nText: {chunk['full_text']}\nPlain Language: {m['plain_language']}\n\n"
            
        # 5. Build prompt for LLM
        user_prompt = f"""
Crisis type: {crisis_type}
User said: {user_description}
State: {jurisdiction_state}
Language for scripted phrase: {language}

Relevant law sections (USE ONLY THESE):
{formatted_law_chunks}

Provide the JSON response now:
"""
        
        # 6. Call Ollama
        try:
            # Check if OLLAMA_BASE_URL is reachable
            response = ollama.chat(model=LLM_MODEL_NAME, messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_prompt},
            ])
            
            # 7. Parse JSON response
            raw_content = response['message']['content']
            # Simple JSON extraction in case LLM adds extra text
            start_idx = raw_content.find('{')
            end_idx = raw_content.rfind('}') + 1
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in LLM response")
            json_str = raw_content[start_idx:end_idx]
            response_data = json.loads(json_str)
        except Exception as e:
            print(f"Ollama error: {e}. Falling back to mock RAG response.")
            # Mock response generation based on retrieved chunks
            response_data = {
                "rights": [],
                "scripted_phrase": "I am invoking my legal rights. I need to speak to a lawyer."
            }
            for chunk in relevant_chunks[:3]:
                m = chunk['metadata']
                response_data["rights"].append({
                    "description": m['plain_language'],
                    "section_number": m['section_number'],
                    "act_name": m['act_name'],
                    "act_year": m['act_year']
                })
            
            # 8. Validate and Hallucination Check
            valid_rights = []
            for right in response_data['rights']:
                # Check if section number exists in our retrieved chunks
                found = False
                for chunk in relevant_chunks:
                    if right['section_number'] == chunk['metadata']['section_number']:
                        found = True
                        break
                
                if found:
                    valid_rights.append(LegalRight(**right))
                else:
                    # Fallback to nearest valid section if hallucinated
                    if relevant_chunks:
                        fallback = relevant_chunks[0]['metadata']
                        valid_rights.append(LegalRight(
                            description=fallback['plain_language'],
                            section_number=fallback['section_number'],
                            act_name=fallback['act_name'],
                            act_year=fallback['act_year']
                        ))
            
            # Ensure exactly 3 rights
            while len(valid_rights) < 3:
                # Fallback to Article 21
                valid_rights.append(LegalRight(
                    description="Right to life and personal liberty",
                    section_number="Article 21",
                    act_name="Constitution of India",
                    act_year=1950
                ))
            
            # 9. Translate rights descriptions to target language
            if language != 'en':
                for right in valid_rights:
                    right.description = translation_service.translate(right.description, target_lang=language)
            
            # 10. Return LegalResponse object
            return LegalResponse(
                crisis_type=crisis_type,
                jurisdiction_state=jurisdiction_state,
                rights=valid_rights[:3],
                scripted_phrase=ScriptedPhrase(
                    phrase=response_data['scripted_phrase'],
                    language=language
                ),
                confidence_score=0.9, # Placeholder
                lawyer_available=True,
                offline_available=True
            )
            
        except Exception as e:
            print(f"Error in RAGService: {e}")
            # Return a safe fallback response
            return LegalResponse(
                crisis_type=crisis_type,
                jurisdiction_state=jurisdiction_state,
                rights=[
                    LegalRight(description="Right to life and personal liberty", section_number="Article 21", act_name="Constitution of India", act_year=1950),
                    LegalRight(description="Right to legal consultation", section_number="Article 22", act_name="Constitution of India", act_year=1950),
                    LegalRight(description="Right to fair procedure", section_number="Article 14", act_name="Constitution of India", act_year=1950)
                ],
                scripted_phrase=ScriptedPhrase(phrase="I request legal assistance.", language=language),
                confidence_score=0.5,
                lawyer_available=True,
                offline_available=True
            )
