"""
Train PCOS Detection Model from Kaggle Dataset
Downloads and trains on real PCOS ultrasound images
"""

import os
import tensorflow as tf
import keras
from keras import layers
import numpy as np
from PIL import Image
import requests
import zipfile
from pathlib import Path
import shutil

def download_kaggle_dataset():
    """
    Download PCOS ultrasound dataset from Kaggle
    
    Dataset: PCOS Ultrasound Images
    You need Kaggle API credentials
    """
    print("="*60)
    print("PCOS Dataset Download")
    print("="*60)
    
    # Check if kaggle is installed
    try:
        import kaggle
        print("✅ Kaggle API found")
    except ImportError:
        print("❌ Kaggle API not found")
        print("\nInstall with: pip install kaggle")
        print("\nThen setup credentials:")
        print("1. Go to https://www.kaggle.com/settings")
        print("2. Click 'Create New API Token'")
        print("3. Place kaggle.json in ~/.kaggle/ (Linux/Mac) or C:\\Users\\<username>\\.kaggle\\ (Windows)")
        return False
    
    # Create dataset directory
    os.makedirs('dataset/pcos_ultrasound', exist_ok=True)
    
    # Download dataset
    # Using a public PCOS ultrasound dataset
    try:
        print("\n📥 Downloading PCOS ultrasound dataset...")
        
        # Option 1: PCOS Detection Dataset
        kaggle.api.dataset_download_files(
            'prasoonkottarathil/polycystic-ovary-syndrome-pcos',
            path='dataset/pcos_ultrasound',
            unzip=True
        )
        
        print("✅ Dataset downloaded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Download failed: {e}")
        print("\nAlternative: Manual download")
        print("1. Go to: https://www.kaggle.com/datasets/prasoonkottarathil/polycystic-ovary-syndrome-pcos")
        print("2. Download the dataset")
        print("3. Extract to: dataset/pcos_ultrasound/")
        return False

def organize_dataset():
    """
    Organize downloaded dataset into train/val structure
    """
    print("\n📁 Organizing dataset...")
    
    base_path = Path('dataset/pcos_ultrasound')
    
    # Create organized structure
    train_path = Path('dataset/ultrasound_organized/train')
    val_path = Path('dataset/ultrasound_organized/val')
    
    for split in [train_path, val_path]:
        (split / 'infected').mkdir(parents=True, exist_ok=True)  # PCOS
        (split / 'notinfected').mkdir(parents=True, exist_ok=True)  # Normal
    
    # Find images
    infected_images = list(base_path.glob('**/infected/*.jpg')) + list(base_path.glob('**/infected/*.png'))
    notinfected_images = list(base_path.glob('**/notinfected/*.jpg')) + list(base_path.glob('**/notinfected/*.png'))
    
    if not infected_images and not notinfected_images:
        # Try alternative structure
        infected_images = list(base_path.glob('**/*infected*/*.jpg')) + list(base_path.glob('**/*infected*/*.png'))
        notinfected_images = list(base_path.glob('**/*not*infected*/*.jpg')) + list(base_path.glob('**/*not*infected*/*.png'))
    
    print(f"Found {len(infected_images)} PCOS images")
    print(f"Found {len(notinfected_images)} Normal images")
    
    if len(infected_images) == 0 or len(notinfected_images) == 0:
        print("❌ Could not find images in expected structure")
        print("Please organize manually:")
        print("  dataset/ultrasound_organized/train/infected/")
        print("  dataset/ultrasound_organized/train/notinfected/")
        print("  dataset/ultrasound_organized/val/infected/")
        print("  dataset/ultrasound_organized/val/notinfected/")
        return False
    
    # Split 80/20 train/val
    def split_and_copy(images, dest_train, dest_val, split_ratio=0.8):
        np.random.shuffle(images)
        split_idx = int(len(images) * split_ratio)
        
        train_images = images[:split_idx]
        val_images = images[split_idx:]
        
        for img in train_images:
            shutil.copy(img, dest_train / img.name)
        
        for img in val_images:
            shutil.copy(img, dest_val / img.name)
        
        return len(train_images), len(val_images)
    
    train_pcos, val_pcos = split_and_copy(
        infected_images,
        train_path / 'infected',
        val_path / 'infected'
    )
    
    train_normal, val_normal = split_and_copy(
        notinfected_images,
        train_path / 'notinfected',
        val_path / 'notinfected'
    )
    
    print(f"\n✅ Dataset organized:")
    print(f"   Training: {train_pcos} PCOS, {train_normal} Normal")
    print(f"   Validation: {val_pcos} PCOS, {val_normal} Normal")
    
    return True

def create_advanced_model(input_shape=(224, 224, 3)):
    """
    Create an advanced CNN model for PCOS detection
    Uses EfficientNetB0 for better accuracy
    """
    print("\n🧠 Creating advanced model...")
    
    # Load pre-trained EfficientNetB0
    base_model = keras.applications.EfficientNetB0(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
    # Create model
    model = keras.Sequential([
        layers.Input(shape=input_shape),
        
        # Preprocessing
        layers.Rescaling(1./255),
        
        # Data augmentation
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.RandomContrast(0.1),
        
        # Base model
        base_model,
        
        # Custom layers
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(1, activation='sigmoid')
    ])
    
    # Compile
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'AUC', 'Precision', 'Recall']
    )
    
    print("✅ Model created")
    model.summary()
    
    return model, base_model

def train_model():
    """
    Train the PCOS detection model
    """
    print("\n" + "="*60)
    print("PCOS Detection Model Training")
    print("="*60)
    
    # Check if organized dataset exists
    if not os.path.exists('dataset/ultrasound_organized/train'):
        print("\n❌ Organized dataset not found")
        print("Run dataset organization first")
        return None
    
    # Load data
    print("\n📊 Loading dataset...")
    
    train_dataset = tf.keras.utils.image_dataset_from_directory(
        'dataset/ultrasound_organized/train',
        image_size=(224, 224),
        batch_size=16,
        label_mode='binary',
        shuffle=True,
        seed=42
    )
    
    val_dataset = tf.keras.utils.image_dataset_from_directory(
        'dataset/ultrasound_organized/val',
        image_size=(224, 224),
        batch_size=16,
        label_mode='binary',
        shuffle=False,
        seed=42
    )
    
    # Optimize performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_dataset = train_dataset.prefetch(buffer_size=AUTOTUNE)
    val_dataset = val_dataset.prefetch(buffer_size=AUTOTUNE)
    
    # Create model
    model, base_model = create_advanced_model()
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7
        ),
        keras.callbacks.ModelCheckpoint(
            'model/pcos_ultrasound_best.h5',
            monitor='val_accuracy',
            save_best_only=True
        )
    ]
    
    # Phase 1: Train with frozen base
    print("\n🎯 Phase 1: Training with frozen base model...")
    history1 = model.fit(
        train_dataset,
        epochs=15,
        validation_data=val_dataset,
        callbacks=callbacks,
        verbose=1
    )
    
    # Phase 2: Fine-tune
    print("\n🎯 Phase 2: Fine-tuning...")
    base_model.trainable = True
    
    # Freeze early layers
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'AUC', 'Precision', 'Recall']
    )
    
    history2 = model.fit(
        train_dataset,
        epochs=10,
        validation_data=val_dataset,
        callbacks=callbacks,
        verbose=1
    )
    
    # Save final model
    os.makedirs('model', exist_ok=True)
    model.save('model/pcos_ultrasound_model.h5')
    
    # Save class indices
    import pickle
    class_indices = {'notinfected': 0, 'infected': 1}  # 0=Normal, 1=PCOS
    with open('model/class_indices.pkl', 'wb') as f:
        pickle.dump(class_indices, f)
    
    print("\n" + "="*60)
    print("✅ Training completed!")
    print("="*60)
    print(f"Final training accuracy: {history2.history['accuracy'][-1]:.4f}")
    print(f"Final validation accuracy: {history2.history['val_accuracy'][-1]:.4f}")
    print(f"Final validation AUC: {history2.history['val_auc'][-1]:.4f}")
    print("\nModel saved to: model/pcos_ultrasound_model.h5")
    
    return model

def main():
    """
    Main training pipeline
    """
    print("\n" + "="*60)
    print("PCOS Detection - Kaggle Dataset Training")
    print("="*60)
    
    # Step 1: Download dataset
    print("\nStep 1: Download Dataset")
    print("-" * 60)
    
    if not os.path.exists('dataset/pcos_ultrasound') or len(os.listdir('dataset/pcos_ultrasound')) == 0:
        success = download_kaggle_dataset()
        if not success:
            print("\n⚠️  Manual setup required:")
            print("1. Download dataset from Kaggle")
            print("2. Extract to: dataset/pcos_ultrasound/")
            print("3. Run this script again")
            return
    else:
        print("✅ Dataset already downloaded")
    
    # Step 2: Organize dataset
    print("\nStep 2: Organize Dataset")
    print("-" * 60)
    
    if not os.path.exists('dataset/ultrasound_organized/train'):
        success = organize_dataset()
        if not success:
            return
    else:
        print("✅ Dataset already organized")
    
    # Step 3: Train model
    print("\nStep 3: Train Model")
    print("-" * 60)
    
    model = train_model()
    
    if model:
        print("\n" + "="*60)
        print("🎉 SUCCESS!")
        print("="*60)
        print("\nYour PCOS detection model is ready!")
        print("\nNext steps:")
        print("1. Start ML API: python app.py")
        print("2. Test with your ultrasound images")
        print("3. The model will now give accurate predictions!")

if __name__ == '__main__':
    main()
