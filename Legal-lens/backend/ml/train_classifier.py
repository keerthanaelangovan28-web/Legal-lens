"""
IndicBERT Fine-tuning Script for Crisis Classification

This script fine-tunes the ai4bharat/indic-bert model on crisis classification data.
Run this offline to generate a fine-tuned model, or use the zero-shot classifier
in classifier_service.py during inference.

Usage:
    python train_classifier.py --data_path ./training_data.json --output_dir ./fine_tuned_model
"""
import json
import argparse
import logging
from pathlib import Path
from typing import List, Dict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CRISIS_LABELS = [
    "police_detention",
    "domestic_violence",
    "eviction",
    "salary_theft",
    "consumer_fraud",
    "other",
]

TRAINING_EXAMPLES = [
    # Police detention
    {"text": "Police stopped me and want to take me to the station", "label": "police_detention"},
    {"text": "I have been arrested without any reason", "label": "police_detention"},
    {"text": "Police are interrogating me and not letting me call my lawyer", "label": "police_detention"},
    {"text": "Police detained me overnight without FIR", "label": "police_detention"},
    {"text": "Officer is threatening to put me in custody", "label": "police_detention"},
    {"text": "पुलिस ने मुझे गिरफ्तार किया", "label": "police_detention"},
    {"text": "போலீஸ் என்னை நிறுத்தி கூட்டிட்டு போகிறார்கள்", "label": "police_detention"},
    # Domestic violence
    {"text": "My husband is beating me and threatening to harm me", "label": "domestic_violence"},
    {"text": "My in-laws are demanding dowry and torturing me", "label": "domestic_violence"},
    {"text": "My family is not letting me leave the house", "label": "domestic_violence"},
    {"text": "I am being abused at home by my spouse", "label": "domestic_violence"},
    {"text": "घर में मेरे साथ मारपीट हो रही है", "label": "domestic_violence"},
    # Eviction
    {"text": "My landlord is throwing me out of the house without notice", "label": "eviction"},
    {"text": "The owner wants to evict me immediately", "label": "eviction"},
    {"text": "Landlord changed the locks and I cannot enter my home", "label": "eviction"},
    {"text": "I am being forced to vacate my rented flat", "label": "eviction"},
    # Salary theft
    {"text": "My boss has not been paying my salary for 3 months", "label": "salary_theft"},
    {"text": "My employer deducted money from my wages illegally", "label": "salary_theft"},
    {"text": "I was fired without notice pay or full dues", "label": "salary_theft"},
    {"text": "Company is not paying minimum wage", "label": "salary_theft"},
    {"text": "मेरी तनख्वाह नहीं दे रहे", "label": "salary_theft"},
    # Consumer fraud
    {"text": "I bought a fake product online and the company refuses refund", "label": "consumer_fraud"},
    {"text": "My bank account was hacked and money was stolen", "label": "consumer_fraud"},
    {"text": "The builder cheated me on the apartment delivery", "label": "consumer_fraud"},
    {"text": "Insurance company is not paying my valid claim", "label": "consumer_fraud"},
]


def prepare_dataset(examples: List[Dict], tokenizer, max_length: int = 128):
    """Tokenize and prepare dataset for training."""
    try:
        import torch
        from torch.utils.data import Dataset

        class CrisisDataset(Dataset):
            def __init__(self, encodings, labels):
                self.encodings = encodings
                self.labels = labels

            def __getitem__(self, idx):
                item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
                item['labels'] = torch.tensor(self.labels[idx])
                return item

            def __len__(self):
                return len(self.labels)

        texts = [ex["text"] for ex in examples]
        labels = [CRISIS_LABELS.index(ex["label"]) for ex in examples]
        encodings = tokenizer(texts, truncation=True, padding=True, max_length=max_length)
        return CrisisDataset(encodings, labels)
    except ImportError:
        logger.error("PyTorch not available. Please install torch.")
        raise


def train(data_path: str = None, output_dir: str = "./fine_tuned_model"):
    """Fine-tune IndicBERT for crisis classification."""
    try:
        from transformers import (
            AutoTokenizer,
            AutoModelForSequenceClassification,
            TrainingArguments,
            Trainer,
        )
        import torch
    except ImportError:
        logger.error("Transformers or PyTorch not installed. Run: pip install transformers torch")
        return

    logger.info("Loading IndicBERT tokenizer and model...")
    MODEL_NAME = "ai4bharat/indic-bert"

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(CRISIS_LABELS),
        id2label={i: label for i, label in enumerate(CRISIS_LABELS)},
        label2id={label: i for i, label in enumerate(CRISIS_LABELS)},
    )

    # Load data
    if data_path and Path(data_path).exists():
        with open(data_path) as f:
            examples = json.load(f)
        logger.info(f"Loaded {len(examples)} examples from {data_path}")
    else:
        examples = TRAINING_EXAMPLES
        logger.info(f"Using built-in {len(examples)} training examples")

    # Prepare dataset (80/20 split)
    split_idx = int(len(examples) * 0.8)
    train_dataset = prepare_dataset(examples[:split_idx], tokenizer)
    eval_dataset = prepare_dataset(examples[split_idx:], tokenizer)

    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        warmup_steps=50,
        weight_decay=0.01,
        logging_dir=f"{output_dir}/logs",
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
    )

    def compute_metrics(eval_pred):
        import numpy as np
        logits, labels = eval_pred
        predictions = np.argmax(logits, axis=-1)
        accuracy = (predictions == labels).mean()
        return {"accuracy": accuracy}

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        compute_metrics=compute_metrics,
    )

    logger.info("Starting fine-tuning...")
    trainer.train()

    logger.info(f"Saving model to {output_dir}")
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    logger.info("Training complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune IndicBERT for crisis classification")
    parser.add_argument("--data_path", type=str, default=None, help="Path to training data JSON")
    parser.add_argument("--output_dir", type=str, default="./fine_tuned_model", help="Model output directory")
    args = parser.parse_args()
    train(args.data_path, args.output_dir)
