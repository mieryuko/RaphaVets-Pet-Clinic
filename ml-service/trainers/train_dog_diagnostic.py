import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import RidgeCV
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import RobustScaler
from scipy.special import expit
from sklearn.metrics import f1_score
import joblib
from pathlib import Path

df = pd.read_csv("../datasets/dog_symptom_disease.csv")

# Prepare features and targets
# Features = all columns starting with "symptom_"
symptom_columns = [col for col in df.columns if col.startswith("symptom_")]

# Labels = all columns starting with "disease_"
disease_columns = [col for col in df.columns if col.startswith("disease_")]

x = df[symptom_columns]
y = df[disease_columns]

# Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.3, random_state=42)

#scale features
scaler = RobustScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
X_train_scaled = pd.DataFrame(X_train_scaled, columns=symptom_columns)
X_test_scaled = pd.DataFrame(X_test_scaled, columns=symptom_columns)

# Compute weights per disease
weights_dict = {}
for disease in disease_columns:
    pos_count = y_train[disease].sum()
    neg_count = len(y_train) - pos_count
    total = len(y_train)
    
    # Balanced formula
    weight_pos = total / (2 * pos_count)
    weight_neg = total / (2 * neg_count)
    
    # Create per-sample weights array
    weights = np.where(y_train[disease] == 1, weight_pos, weight_neg)
    weights_dict[disease] = weights

# Train a separate model for each disease
models = {}
for disease in disease_columns:
    model = LogisticRegression(
        class_weight='balanced', 
        max_iter=1000, 
        solver='liblinear'
    )
    model.fit(X_train_scaled, y_train[disease])
    models[disease] = model

# Predict all diseases on test set
for disease, model in models.items():
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    y_pred_binary = (y_pred_proba >= 0.5).astype(int)
    f1 = f1_score(y_test[disease], y_pred_binary)
    print(f"{disease}: F1 Score = {f1:.4f}")

# Save the model
ml_service_root = Path(__file__).parent.parent
model_dir = ml_service_root / "models"
model_dir.mkdir(parents=True, exist_ok=True)
model_path = model_dir / "dog_diagnostic_model.pkl"
model_path.parent.mkdir(parents=True, exist_ok=True)
scaler_path = model_dir / "dog_diagnostic_scaler.pkl"
scaler_path.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(scaler, scaler_path)
joblib.dump(models, model_path)
