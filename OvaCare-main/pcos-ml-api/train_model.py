import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle
import os

# Load dataset
df = pd.read_csv('dataset/PCOS_data.csv')

# Clean column names
df.columns = df.columns.str.strip().str.lower()

# Drop irrelevant or unnamed columns
df = df.drop(columns=['patient file no.', 'sl. no', 'unnamed: 44'], errors='ignore')

# Drop rows with missing values (optional: you can also fill instead of drop)
df = df.dropna()

# Feature selection
features = ['age (yrs)', 'bmi', 'hair growth(y/n)', 'pimples(y/n)', 'cycle(r/i)']
X = df[features]
y = df['pcos (y/n)'].astype(int)  # ensure target is integer

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Ensure model folder exists
os.makedirs('model', exist_ok=True)

# Save model
with open('model/pcos_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("✅ Model trained and saved to model/pcos_model.pkl.")
