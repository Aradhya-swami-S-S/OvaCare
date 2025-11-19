"""
Train a CNN model for PCOS detection from ultrasound images
This creates a working model that can classify ultrasound images
"""

import tensorflow as tf
import keras
from keras import layers
import numpy as np
import os
import pickle
from PIL import Image

# Try to import ImageDataGenerator from different locations
try:
    from keras.preprocessing.image import ImageDataGenerator
except ImportError:
    try:
        from tensorflow.keras.preprocessing.image import ImageDataGenerator
    except ImportError:
        # For newer versions, we'll use a custom implementation
        ImageDataGenerator = None

def create_pcos_ultrasound_model(input_shape=(224, 224, 3)):
    """
    Create a CNN model for PCOS detection from ultrasound images
    Uses transfer learning with MobileNetV2 for efficiency
    """
    
    # Load pre-trained MobileNetV2 (trained on ImageNet)
    try:
        base_model = keras.applications.MobileNetV2(
            input_shape=input_shape,
            include_top=False,
            weights='imagenet'
        )
    except Exception as e:
        print(f"Warning: Could not load MobileNetV2 with imagenet weights: {e}")
        print("Loading without pre-trained weights...")
        base_model = keras.applications.MobileNetV2(
            input_shape=input_shape,
            include_top=False,
            weights=None
        )
    
    # Freeze base model layers
    base_model.trainable = False
    
    # Create model
    model = keras.Sequential([
        # Input layer
        layers.Input(shape=input_shape),
        
        # Preprocessing
        layers.Rescaling(1./255),
        
        # Base model
        base_model,
        
        # Custom layers for PCOS detection
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(64, activation='relu'),
        layers.Dense(1, activation='sigmoid')  # Binary classification
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'AUC']
    )
    
    return model

def create_synthetic_training_data():
    """
    Create synthetic training data for demonstration
    In production, replace with real ultrasound images
    """
    print("Creating synthetic training data...")
    
    # Create directories
    os.makedirs('dataset/ultrasound/train/pcos', exist_ok=True)
    os.makedirs('dataset/ultrasound/train/normal', exist_ok=True)
    os.makedirs('dataset/ultrasound/val/pcos', exist_ok=True)
    os.makedirs('dataset/ultrasound/val/normal', exist_ok=True)
    
    # Generate synthetic ultrasound-like images
    for i in range(50):  # 50 PCOS images
        img = generate_synthetic_ultrasound(has_pcos=True)
        img_path = f'dataset/ultrasound/train/pcos/pcos_{i}.png'
        Image.fromarray(img).save(img_path)
    
    for i in range(50):  # 50 Normal images
        img = generate_synthetic_ultrasound(has_pcos=False)
        img_path = f'dataset/ultrasound/train/normal/normal_{i}.png'
        Image.fromarray(img).save(img_path)
    
    # Validation set
    for i in range(10):
        img = generate_synthetic_ultrasound(has_pcos=True)
        img_path = f'dataset/ultrasound/val/pcos/pcos_{i}.png'
        Image.fromarray(img).save(img_path)
    
    for i in range(10):
        img = generate_synthetic_ultrasound(has_pcos=False)
        img_path = f'dataset/ultrasound/val/normal/normal_{i}.png'
        Image.fromarray(img).save(img_path)
    
    print("Synthetic data created!")

def generate_synthetic_ultrasound(has_pcos=False, size=(224, 224)):
    """
    Generate synthetic ultrasound-like image
    """
    img = np.random.randint(30, 100, size=(size[0], size[1], 3), dtype=np.uint8)
    
    if has_pcos:
        # Add multiple small circles (follicles) for PCOS
        num_follicles = np.random.randint(12, 25)
        for _ in range(num_follicles):
            center_x = np.random.randint(50, size[0]-50)
            center_y = np.random.randint(50, size[1]-50)
            radius = np.random.randint(5, 15)
            
            # Draw circle
            y, x = np.ogrid[:size[0], :size[1]]
            mask = (x - center_x)**2 + (y - center_y)**2 <= radius**2
            img[mask] = np.random.randint(150, 200, 3)
    else:
        # Add fewer, larger structures for normal ovary
        num_structures = np.random.randint(3, 8)
        for _ in range(num_structures):
            center_x = np.random.randint(50, size[0]-50)
            center_y = np.random.randint(50, size[1]-50)
            radius = np.random.randint(10, 25)
            
            y, x = np.ogrid[:size[0], :size[1]]
            mask = (x - center_x)**2 + (y - center_y)**2 <= radius**2
            img[mask] = np.random.randint(120, 160, 3)
    
    return img

def train_model():
    """
    Train the PCOS ultrasound detection model
    """
    print("Starting PCOS Ultrasound Model Training...")
    
    # Check if dataset exists, if not create synthetic data
    if not os.path.exists('dataset/ultrasound/train'):
        print("Dataset not found. Creating synthetic training data...")
        create_synthetic_training_data()
    
    # Use tf.keras.utils.image_dataset_from_directory for newer TensorFlow
    try:
        # For TensorFlow 2.16+
        train_dataset = tf.keras.utils.image_dataset_from_directory(
            'dataset/ultrasound/train',
            image_size=(224, 224),
            batch_size=16,
            label_mode='binary',
            shuffle=True,
            seed=42
        )
        
        val_dataset = tf.keras.utils.image_dataset_from_directory(
            'dataset/ultrasound/val',
            image_size=(224, 224),
            batch_size=16,
            label_mode='binary',
            shuffle=False,
            seed=42
        )
        
        # Apply data augmentation
        data_augmentation = keras.Sequential([
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.1),
            layers.RandomZoom(0.2),
        ])
        
        train_dataset = train_dataset.map(lambda x, y: (data_augmentation(x, training=True), y))
        
        # Get class names
        class_names = train_dataset.class_names
        class_indices = {name: idx for idx, name in enumerate(class_names)}
        
        train_generator = train_dataset
        val_generator = val_dataset
        
    except Exception as e:
        print(f"Error loading dataset: {e}")
        print("Trying alternative method...")
        
        # Fallback to ImageDataGenerator if available
        if ImageDataGenerator is not None:
            train_datagen = ImageDataGenerator(
                rotation_range=20,
                width_shift_range=0.2,
                height_shift_range=0.2,
                horizontal_flip=True,
                zoom_range=0.2,
                fill_mode='nearest',
                rescale=1./255
            )
            
            val_datagen = ImageDataGenerator(rescale=1./255)
            
            train_generator = train_datagen.flow_from_directory(
                'dataset/ultrasound/train',
                target_size=(224, 224),
                batch_size=16,
                class_mode='binary',
                shuffle=True
            )
            
            val_generator = val_datagen.flow_from_directory(
                'dataset/ultrasound/val',
                target_size=(224, 224),
                batch_size=16,
                class_mode='binary',
                shuffle=False
            )
            
            class_indices = train_generator.class_indices
        else:
            raise Exception("Could not load dataset with any method")
    
    # Create model
    print("Creating model...")
    model = create_pcos_ultrasound_model()
    
    # Print model summary
    model.summary()
    
    # Train model
    print("Training model...")
    history = model.fit(
        train_generator,
        epochs=10,
        validation_data=val_generator,
        verbose=1
    )
    
    # Save model
    os.makedirs('model', exist_ok=True)
    model.save('model/pcos_ultrasound_model.h5')
    print("Model saved to model/pcos_ultrasound_model.h5")
    
    # Save class indices
    with open('model/class_indices.pkl', 'wb') as f:
        pickle.dump(class_indices, f)
    
    # Print training results
    print("\nTraining completed!")
    print(f"Final training accuracy: {history.history['accuracy'][-1]:.4f}")
    print(f"Final validation accuracy: {history.history['val_accuracy'][-1]:.4f}")
    
    return model, history

if __name__ == '__main__':
    # Train the model
    model, history = train_model()
    
    print("\n" + "="*50)
    print("IMPORTANT: Replace synthetic data with real ultrasound images!")
    print("="*50)
    print("\nTo use real data:")
    print("1. Organize images in this structure:")
    print("   dataset/ultrasound/train/pcos/")
    print("   dataset/ultrasound/train/normal/")
    print("   dataset/ultrasound/val/pcos/")
    print("   dataset/ultrasound/val/normal/")
    print("2. Run this script again")
    print("3. The model will be trained on your real data")
