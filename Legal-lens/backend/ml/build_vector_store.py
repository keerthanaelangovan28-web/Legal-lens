import json
import os
import glob
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

# Configuration
CORPUS_DIR = "backend/data/law_corpus"
CHROMA_DB_DIR = "backend/data/vector_store"
COLLECTION_NAME = "indian_law_corpus"
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

def build_vector_store():
    print(f"Loading embedding model: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    
    print(f"Initializing ChromaDB in {CHROMA_DB_DIR}...")
    client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
    
    # Delete existing collection if it exists
    try:
        client.delete_collection(COLLECTION_NAME)
    except:
        pass
        
    collection = client.create_collection(name=COLLECTION_NAME)
    
    law_files = glob.glob(os.path.join(CORPUS_DIR, "*.json"))
    print(f"Found {len(law_files)} law corpus files.")
    
    all_documents = []
    all_metadatas = []
    all_ids = []
    all_texts_to_embed = []
    
    for file_path in law_files:
        print(f"Processing {file_path}...")
        with open(file_path, 'r') as f:
            entries = json.load(f)
            
        for entry in entries:
            # Create text for embedding
            text_to_embed = f"{entry['section_title']} {entry['plain_language']} {' '.join(entry['keywords'])}"
            
            all_documents.append(entry['full_text'])
            all_metadatas.append({
                "section_id": entry['section_id'],
                "act_name": entry['act_name'],
                "act_year": entry['act_year'],
                "section_number": entry['section_number'],
                "crisis_tags": ",".join(entry['crisis_tags']),
                "states_applicable": ",".join(entry['states_applicable']),
                "plain_language": entry['plain_language']
            })
            all_ids.append(entry['section_id'])
            all_texts_to_embed.append(text_to_embed)
            
    print(f"Generating embeddings for {len(all_texts_to_embed)} entries...")
    embeddings = model.encode(all_texts_to_embed).tolist()
    
    print("Adding entries to ChromaDB...")
    # ChromaDB add has limits on batch size, but for ~80 entries it's fine
    collection.add(
        embeddings=embeddings,
        documents=all_documents,
        metadatas=all_metadatas,
        ids=all_ids
    )
    
    print("Vector store build complete.")

if __name__ == "__main__":
    build_vector_store()
