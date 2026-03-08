import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, precision_score, recall_score

#Config
ML_MODELS_PATH = Path(__file__).parent.parent / "models" / "dog_diagnostic_model.pkl"
SCALER_PATH = Path(__file__).parent.parent / "models" / "dog_diagnostic_scaler.pkl"
DATA_PATH = Path(__file__).parent.parent / "datasets" / "dog_symptom_disease.csv"

# Load the trained model and scaler
model = joblib.load(ML_MODELS_PATH)
scaler = joblib.load(SCALER_PATH)
# Load the dataset
df = pd.read_csv(DATA_PATH)

# Prepare features and targets
symptom_columns = [col for col in df.columns if col.startswith("symptom_")]
disease_columns = [col for col in df.columns if col.startswith("disease_")]
x = df[symptom_columns]
y = df[disease_columns]

# Scale features
x_scaled = scaler.transform(x)
x_scaled = pd.DataFrame(x_scaled, columns=symptom_columns)

X_train, X_test, y_train, y_test = train_test_split(
    x_scaled, y, test_size=0.3, random_state=42
)

# Predict risk score for each disease
y_pred = pd.DataFrame({
    disease: model.predict(x_scaled)
    for disease, model in model.items()
})

THRESHOLD = 0.5
y_pred_binary = (y_pred >= THRESHOLD).astype(int)

TOP_K = 3
y_pred_topk = pd.DataFrame(0, index=y_pred.index, columns=y_pred.columns)
for idx, row in y_pred.iterrows():
    topk_diseases = row.nlargest(TOP_K).index
    y_pred_topk.loc[idx, topk_diseases] = 1

#Evaluate metrics
f1_per_disease = {d: f1_score(y[d], y_pred_binary[d]) for d in disease_columns}
precision_per_disease = {d: precision_score(y[d], y_pred_binary[d]) for d in disease_columns}
recall_per_disease = {d: recall_score(y[d], y_pred_binary[d]) for d in disease_columns}

# Evaluate Top-K metrics per patient
precision_list = []
recall_list = []

for idx, row in y_pred.iterrows():
    topk_diseases = row.nlargest(TOP_K).index
    true_positive_diseases = y.loc[idx].astype(bool)
    
    precision = true_positive_diseases[topk_diseases].sum() / TOP_K
    recall = true_positive_diseases[topk_diseases].sum() / true_positive_diseases.sum() if true_positive_diseases.sum() > 0 else 0
    
    precision_list.append(precision)
    recall_list.append(recall)

mean_precision_at_k = np.mean(precision_list)
mean_recall_at_k = np.mean(recall_list)
f1_at_k = 2 * mean_precision_at_k * mean_recall_at_k / (mean_precision_at_k + mean_recall_at_k + 1e-8)

#Binary metrics   
print("=== F1 Scores per disease ===")
for d, score in f1_per_disease.items():
    print(f"{d}: {score:.3f}")

print("\n=== Precision per disease ===")
for d, score in precision_per_disease.items():
    print(f"{d}: {score:.3f}")

print("\n=== Recall per disease ===")
for d, score in recall_per_disease.items():
    print(f"{d}: {score:.3f}")

#Top-K metrics
print(f"\n=== (Top-{TOP_K} metrics) ===")
print(f"Mean Precision@{TOP_K}: {mean_precision_at_k:.3f}")
print(f"Mean Recall@{TOP_K}: {mean_recall_at_k:.3f}")
print(f"F1@{TOP_K}: {f1_at_k:.3f}")

print(x.shape)
print(x.drop_duplicates().shape)
print(y.corr())
print(x.columns)