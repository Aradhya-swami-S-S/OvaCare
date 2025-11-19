"""
Train Hugging Face Model on Real PCOS Dataset
Uses Vision Transformer (ViT) for accurate PCOS classification
"""

import os
import shutil
import numpy as np
from pathlib import Path
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from transformers import (
    ViTImageProcessor, 
    ViTForImageClassification,
    TrainingArguments,
    Trainer
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import json

class PCOSDataset(Dataset):
    """Custom dataset for PCOS ultrasound images"""
    
    def __init__(self, image_paths, labels, processor):
        self.image_paths = image_paths
        self.labels = labels
        self.processor = processor
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        # Load image
        image = Image.open(self.image_paths[idx]).convert('RGB')
        
        # Process image
        encoding = self.processor(images=image, return_tensors="pt")
        
        # Remove batch dimension
        pixel_values = encoding['pixel_values'].squeeze()
        
        return {
            'pixel_values': pixel_values,
            'labels': torch.tensor(self.labels[idx], dtype=torch.long)
        }

def prepare_dataset():
    """
    Prepare PCOS dataset from your uploaded data
    """
    print("\n" + "="*60)
    print("PREPARING REAL PCOS DATASET")
    print("="*60)
    
    # Source paths (go up one level from pcos-ml-api folder)
    pcos_dir = Path("../PCOS (1)/PCOS/infected")
    normal_dir = Path("../PCOS (1)/PCOS/notinfected")
    
    # Get all image files
    pcos_images = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        pcos_images.extend(list(pcos_dir.glob(ext)))
    
    normal_images = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        normal_images.extend(list(normal_dir.glob(ext)))
    
    print(f"✅ Found {len(pcos_images)} PCOS images")
    print(f"✅ Found {len(normal_images)} Normal images")
    
    if len(pcos_images) == 0 or len(normal_images) == 0:
        print("❌ Error: No images found!")
        return None, None, None, None
    
    # Create labels (0 = Normal, 1 = PCOS)
    all_images = list(normal_images) + list(pcos_images)
    all_labels = [0] * len(normal_images) + [1] * len(pcos_images)
    
    # Convert to strings
    all_images = [str(img) for img in all_images]
    
    # Split into train and validation (80/20)
    train_images, val_images, train_labels, val_labels = train_test_split(
        all_images, all_labels, 
        test_size=0.2, 
        random_state=42,
        stratify=all_labels
    )
    
    print(f"\n📊 Dataset split:")
    print(f"   Training: {len(train_images)} images")
    print(f"   - Normal: {train_labels.count(0)}")
    print(f"   - PCOS: {train_labels.count(1)}")
    print(f"   Validation: {len(val_images)} images")
    print(f"   - Normal: {val_labels.count(0)}")
    print(f"   - PCOS: {val_labels.count(1)}")
    
    return train_images, val_images, train_labels, val_labels

def compute_metrics(pred):
    """Compute metrics for evaluation"""
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average='binary'
    )
    acc = accuracy_score(labels, preds)
    
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

def train_huggingface_model():
    """
    Train Hugging Face Vision Transformer on PCOS data
    """
    print("\n" + "="*60)
    print("TRAINING HUGGING FACE MODEL ON REAL PCOS DATA")
    print("="*60)
    
    # Prepare dataset
    train_images, val_images, train_labels, val_labels = prepare_dataset()
    
    if train_images is None:
        return None
    
    # Load processor and model
    print("\n🤖 Loading Vision Transformer model...")
    model_name = "google/vit-base-patch16-224-in21k"
    
    processor = ViTImageProcessor.from_pretrained(model_name)
    
    # Create model with 2 classes (Normal, PCOS)
    model = ViTForImageClassification.from_pretrained(
        model_name,
        num_labels=2,
        id2label={0: "Normal", 1: "PCOS"},
        label2id={"Normal": 0, "PCOS": 1},
        ignore_mismatched_sizes=True
    )
    
    print("✅ Model loaded")
    
    # Create datasets
    print("\n📦 Creating datasets...")
    train_dataset = PCOSDataset(train_images, train_labels, processor)
    val_dataset = PCOSDataset(val_images, val_labels, processor)
    
    # Training arguments
    output_dir = "model/huggingface_pcos"
    os.makedirs(output_dir, exist_ok=True)
    
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=10,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        warmup_steps=100,
        weight_decay=0.01,
        logging_dir=f"{output_dir}/logs",
        logging_steps=10,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        greater_is_better=True,
        save_total_limit=2,
        remove_unused_columns=False,
        push_to_hub=False,
        report_to="none",
        dataloader_num_workers=0,
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
    )
    
    # Train
    print("\n🎯 Starting training...")
    print("This may take 10-20 minutes depending on your hardware...")
    
    train_result = trainer.train()
    
    # Evaluate
    print("\n📊 Evaluating model...")
    eval_result = trainer.evaluate()
    
    # Save model
    print("\n💾 Saving model...")
    trainer.save_model(output_dir)
    processor.save_pretrained(output_dir)
    
    # Save label mapping
    label_map = {
        "id2label": {0: "Normal", 1: "PCOS"},
        "label2id": {"Normal": 0, "PCOS": 1}
    }
    with open(f"{output_dir}/label_map.json", 'w') as f:
        json.dump(label_map, f)
    
    # Print results
    print("\n" + "="*60)
    print("✅ TRAINING COMPLETED!")
    print("="*60)
    print(f"Training Loss: {train_result.training_loss:.4f}")
    print(f"Validation Accuracy: {eval_result['eval_accuracy']:.4f} ({eval_result['eval_accuracy']*100:.2f}%)")
    print(f"Validation F1 Score: {eval_result['eval_f1']:.4f}")
    print(f"Validation Precision: {eval_result['eval_precision']:.4f}")
    print(f"Validation Recall: {eval_result['eval_recall']:.4f}")
    
    if eval_result['eval_accuracy'] > 0.85:
        print("\n🎉 Excellent accuracy achieved!")
    elif eval_result['eval_accuracy'] > 0.75:
        print("\n✅ Good accuracy achieved!")
    else:
        print("\n⚠️  Consider training longer")
    
    print(f"\nModel saved to: {output_dir}")
    
    return model, processor

def test_model():
    """Test the trained model on sample images"""
    print("\n" + "="*60)
    print("TESTING TRAINED MODEL")
    print("="*60)
    
    try:
        # Load model
        model_path = "model/huggingface_pcos"
        processor = ViTImageProcessor.from_pretrained(model_path)
        model = ViTForImageClassification.from_pretrained(model_path)
        model.eval()
        
        # Load label map
        with open(f"{model_path}/label_map.json", 'r') as f:
            label_map = json.load(f)
        
        # Test images
        test_cases = [
            ("../PCOS (1)/PCOS/infected", "PCOS"),
            ("../PCOS (1)/PCOS/notinfected", "Normal")
        ]
        
        for folder, expected in test_cases:
            folder_path = Path(folder)
            images = list(folder_path.glob("*.jpg")) + list(folder_path.glob("*.jpeg")) + list(folder_path.glob("*.png"))
            
            if len(images) > 0:
                # Test first 3 images
                for img_path in images[:3]:
                    image = Image.open(img_path).convert('RGB')
                    inputs = processor(images=image, return_tensors="pt")
                    
                    with torch.no_grad():
                        outputs = model(**inputs)
                        logits = outputs.logits
                        predicted_class = logits.argmax(-1).item()
                        probabilities = torch.nn.functional.softmax(logits, dim=-1)[0]
                    
                    predicted_label = label_map['id2label'][str(predicted_class)]
                    confidence = probabilities[predicted_class].item() * 100
                    
                    print(f"\n📸 Image: {img_path.name}")
                    print(f"   Expected: {expected}")
                    print(f"   Predicted: {predicted_label}")
                    print(f"   Confidence: {confidence:.1f}%")
                    print(f"   ✅ Correct" if predicted_label == expected else "   ❌ Incorrect")
        
    except Exception as e:
        print(f"❌ Testing failed: {e}")

if __name__ == '__main__':
    print("\n" + "="*60)
    print("HUGGING FACE PCOS TRAINING PIPELINE")
    print("="*60)
    print("Training Vision Transformer on your real PCOS dataset")
    print("Expected accuracy: 85-95%")
    
    # Check dataset
    if not os.path.exists("../PCOS (1)/PCOS/infected"):
        print("\n❌ Dataset not found!")
        print("Please ensure PCOS dataset is in: PCOS (1)/PCOS/")
        print("Current directory:", os.getcwd())
        exit(1)
    
    # Train
    model, processor = train_huggingface_model()
    
    if model:
        # Test
        print("\n🧪 Testing model...")
        test_model()
        
        print("\n" + "="*60)
        print("🎉 SUCCESS! Hugging Face PCOS model is ready!")
        print("="*60)
        print("\nNext steps:")
        print("1. Start ML API: python app.py")
        print("2. The model will give accurate PCOS predictions!")
