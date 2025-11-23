"""
Simple PCOS Training Script
Trains a CNN model on your real PCOS ultrasound dataset
"""

import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle

def load_images_from_folder(folder_path, label, target_size=(224, 224)):
    """Load and preprocess images from a folder"""
    images = []
    labels = []
    
    print(f"Loading images from {folder_path}...")
    
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            try:
                img_path = os.path.join(folder_path, filename)
                img = Image.open(img_path).convert('RGB')
                img = img.resize(target_size)
                img_array = np.array(img) / 255.0  # Normalize to 0-1
                
                images.append(img_array)
                labels.append(label)
                
                if len(images) % 100 == 0:
                    print(f"  Loaded {len(images)} images...")
                    
            except Exception as e:
                print(f"  Error loading {filename}: {e}")
                continue
    
    return np.array(images), np.array(labels)

def create_simple_cnn_model(input_shape=(224, 224, 3)):
    """Create a simple CNN model for PCOS detection"""
    
    model = keras.Sequential([
        # First convolutional block
        keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        keras.layers.MaxPooling2D((2, 2)),
        
        # Second convolutional block
        keras.layers.Conv2D(64, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        
        # Third convolutional block
        keras.layers.Conv2D(128, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        
        # Fourth convolutional block
        keras.layers.Conv2D(128, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        
        # Flatten and dense layers
        keras.layers.Flatten(),
        keras.layers.Dropout(0.5),
        keras.layers.Dense(512, activation='relu'),
        keras.layers.Dropout(0.5),
        keras.layers.Dense(1, activation='sigmoid')  # Binary classification
    ])
    
    return model

def main():
    print("="*60)
    print("SIMPLE PCOS CNN TRAINING")
    print("="*60)
    
    # Dataset paths
    pcos_folder = "../PCOS (1)/PCOS/infected"
    normal_folder = "../PCOS (1)/PCOS/notinfected"
    
    # Check if folders exist
    if not os.path.exists(pcos_folder):
        print(f"❌ PCOS folder not found: {pcos_folder}")
        return
    
    if not os.path.exists(normal_folder):
        print(f"❌ Normal folder not found: {normal_folder}")
        return
    
    # Load images
    print("\n📂 Loading PCOS images...")
    pcos_images, pcos_labels = load_images_from_folder(pcos_folder, 1)  # 1 = PCOS
    
    print("\n📂 Loading Normal images...")
    normal_images, normal_labels = load_images_from_folder(normal_folder, 0)  # 0 = Normal
    
    # Combine datasets
    print(f"\n📊 Dataset Summary:")
    print(f"   PCOS images: {len(pcos_images)}")
    print(f"   Normal images: {len(normal_images)}")
    print(f"   Total images: {len(pcos_images) + len(normal_images)}")
    
    # Combine all data
    X = np.concatenate([pcos_images, normal_images], axis=0)
    y = np.concatenate([pcos_labels, normal_labels], axis=0)
    
    # Split into train/validation sets
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n🔄 Data Split:")
    print(f"   Training: {len(X_train)} images")
    print(f"   Validation: {len(X_val)} images")
    
    # Create model
    print(f"\n🤖 Creating CNN model...")
    model = create_simple_cnn_model()
    
    # Compile model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    # Print model summary
    print(f"\n📋 Model Architecture:")
    model.summary()
    
    # Train model
    print(f"\n🚀 Starting training...")
    print("This will take 5-15 minutes depending on your hardware...")
    
    history = model.fit(
        X_train, y_train,
        batch_size=32,
        epochs=10,  # Start with fewer epochs for faster training
        validation_data=(X_val, y_val),
        verbose=1
    )
    
    # Evaluate model
    print(f"\n📊 Evaluating model...")
    val_predictions = model.predict(X_val)
    val_predictions_binary = (val_predictions > 0.5).astype(int).flatten()
    
    accuracy = accuracy_score(y_val, val_predictions_binary)
    print(f"\n✅ Validation Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Print detailed classification report
    print(f"\n📈 Classification Report:")
    print(classification_report(y_val, val_predictions_binary, 
                              target_names=['Normal', 'PCOS']))
    
    # Save model
    model_dir = "model"
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, "pcos_cnn_model.h5")
    model.save(model_path)
    print(f"\n💾 Model saved to: {model_path}")
    
    # Save training history
    history_path = os.path.join(model_dir, "training_history.pkl")
    with open(history_path, 'wb') as f:
        pickle.dump(history.history, f)
    
    print(f"\n🎉 Training completed successfully!")
    print(f"   Model accuracy: {accuracy*100:.2f}%")
    print(f"   Model saved: {model_path}")
    
    if accuracy > 0.8:
        print(f"   ✅ Excellent accuracy! Model is ready for use.")
    elif accuracy > 0.7:
        print(f"   ✅ Good accuracy! Model should work well.")
    else:
        print(f"   ⚠️  Consider training for more epochs to improve accuracy.")

if __name__ == "__main__":
    main()