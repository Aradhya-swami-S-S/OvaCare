# check_cleaned_columns.py
import pandas as pd

df = pd.read_csv('dataset/PCOS_data.csv')
df.columns = df.columns.str.strip().str.lower()
print(df.columns.tolist())
