# predictors/dog_disease_predictor.py

import pandas as pd
import joblib
from pathlib import Path

# Paths
ml_service_root = Path(__file__).resolve().parents[1]
MODEL_DIR = ml_service_root / "models"
SCALER_PATH = MODEL_DIR / "dog_diagnostic_scaler.pkl"
MODEL_PATH = MODEL_DIR / "dog_diagnostic_model.pkl"
DATASET_PATH = ml_service_root / "datasets" / "dog_symptom_disease.csv"

# Load scaler and models once
scaler = joblib.load(SCALER_PATH)
models = joblib.load(MODEL_PATH)

# Load symptom columns to match training
df = pd.read_csv(DATASET_PATH)
symptom_columns = [col for col in df.columns if col.startswith("symptom_")]
disease_columns = [col for col in df.columns if col.startswith("disease_")]

system_definitions = {
    "Systemic": {
        "symptoms": [
            "fever", "lethargy", "depression", "pain", "discomfort",
            "weakness", "coma", "collapse", "lack_of_energy"
        ],
        "present": "systemic_present",
        "score": "systemic_score"
    },
    "Respiratory": {
        "symptoms": ["nasal_discharge", "breathing_difficulty", "coughing"],
        "present": "respiratory_present",
        "score": "respiratory_score"
    },
    "Gastrointestinal": {
        "symptoms": [
            "enlarged_liver", "yellow_gums", "vomiting", "diarrhea",
            "bloated_stomach", "burping", "passing_gases",
            "constipation", "eating_grass", "purging", "abdominal_pain"
        ],
        "present": "gastrointestinal_present",
        "score": "gastrointestinal_score"
    },
    "Metabolic_Urinary": {
        "symptoms": [
            "weight_loss", "severe_dehydration", "increased_drinking_and_urination",
            "glucose_in_urine", "anorexia", "blood_in_urine", "urine_infection",
            "difficulty_urinating"
        ],
        "present": "metabolic_urinary_present",
        "score": "metabolic_urinary_score"
    },
    "Vision": {
        "symptoms": ["acute_blindness", "cataracts", "losing_sight", "blindness", "eye_discharge"],
        "present": "vision_present",
        "score": "vision_score"
    },
    "Muscoloskeletal": {
        "symptoms": [
            "excess_jaw_tone", "lameness", "stiff_and_hard_tail",
            "stiffness_of_muscles", "continuously_erect_and_stiff_ears", "grinning_appearance", "wrinkled_forehead"
        ],
        "present": "muscoloskeletal_present",
        "score": "muscoloskeletal_score"
    },
    "Neurological": {
        "symptoms": [
            "paralysis", "seizures", "neurological_disorders",
            "loss_of_consciousness"
        ],
        "present": "neurological_present",
        "score": "neurological_score"
    },
    "Dental": {
        "symptoms": [
            "excessive_salivation", "swelling_of_gum", "redness_of_gum", "receding_gum", 
            "bleeding_of_gum", "plaque", "bad_breath", "tartar"
        ],
        "present": "dental_present",
        "score": "dental_score"
    },
    "Dermatological": {
        "symptoms": [
            "scratching", "licking", "itchy_skin", "redness_of_skin",
            "face_rubbing", "fur_loss", "red_bumps",
            "scabs", "irritation", "dry_skin", "red_patches",
            "dandruff", "smelly", "wounds"
        ],
        "present": "dermatological_present",
        "score": "dermatological_score"
    },
    "Lymphatic": {
        "symptoms": ["swollen_lymph_nodes", "sepsis", "pale_gums"],
        "present": "lymphatic_present",
        "score": "lymphatic_score"
    },
    "Cardiovascular": {
        "symptoms": ["heart_complication"],
        "present": "cardiovascular_present",
        "score": "cardiovascular_score"
    },
    "Other": {
        "symptoms": ["aggression", "hunger"],
        "present": "other_present",
        "score": "other_score"
    }
}

def prepare_input(symptom_input: list):
    """
    Convert list of symptom names to a DataFrame with 0/1 values for each symptom.
    :param symptom_input: list of symptom names (e.g. ["symptom_fever", "symptom_cough"])
    :return: DataFrame with one row and columns for each symptom
    """
    features = {}

    for col in symptom_columns:
        features[col] = 1 if col in symptom_input else 0

    ordered_features = []
    for system_name, system_def in system_definitions.items():
        system_symptoms = [f"symptom_{s}" for s in system_def["symptoms"]]
        system_present_col = f"symptom_{system_def['present']}"
        system_score_col = f"symptom_{system_def['score']}"

        #Collect values for this system
        values = [features.get(symptom, 0) for symptom in system_symptoms]

        #compute aggregate features
        features[system_present_col] = 1 if any(values) else 0
        features[system_score_col] = sum(values) / len(system_symptoms) if system_symptoms else 0

        #interleave present and score in ordered features
        ordered_features.extend(system_symptoms + [system_present_col, system_score_col])
    # Convert to DataFrame
    df_input = pd.DataFrame([features], columns=ordered_features)

    return df_input

def format_disease_output(raw_name: str) -> str:
    """
    Convert raw disease column name to a more user-friendly format.
    E.g. "disease_parvovirus" -> "Parvovirus"
    """
    if raw_name.startswith("disease_"):
        return raw_name[len("disease_"):].replace('_', ' ').title()
    return raw_name.title()

def format_symptom(raw_name: str) -> str:
    """
    Convert raw symptom column name to a more user-friendly format.
    E.g. "symptom_fever" -> "Fever"
    """
    if raw_name.startswith("symptom_"):
        return raw_name[len("symptom_"):].replace('_', ' ').title()
    return raw_name.title()

def predict_dog(symptom_input: dict, top_k: int = 3):
    """
    Predict top K disease risk scores from symptom input.
    :param symptom_input: dict {symptom_name: 0 or 1}
    :param top_k: number of top predictions to return
    :return: dict with top_k_diseases and risk_scores
    """
    # Prepare DataFrame
    x_input = prepare_input(symptom_input)

    trained_cols = models[disease_columns[0]].feature_names_in_
    input_cols = x_input.columns

    for i, (t, x) in enumerate(zip(trained_cols, input_cols)):
        if t != x:
            print(f"Mismatch at position {i}: trained='{t}', input='{x}'")
    
    trained_set = set(trained_cols)
    input_set   = set(input_cols)

    print("Missing in input:", trained_set - input_set)
    print("Extra in input:", input_set - trained_set)

    # Scale features
    x_scaled = pd.DataFrame(scaler.transform(x_input), columns=symptom_columns)
    
    # Predict risk scores
    y_pred_input = {disease: model.predict(x_scaled)[0] for disease, model in models.items()}
    
    # Sort descending
    # Sort the predicted diseases by risk score in descending order
    sorted_predictions = pd.Series(y_pred_input).sort_values(ascending=False)

    # Select the top 3 predictions
    top_k_diseases = sorted_predictions.index[:top_k]
    top_k_scores   = sorted_predictions.values[:top_k]

    # Pair each disease with its risk score
    top_k_pairs = list(zip(top_k_diseases, top_k_scores))

    user_selected_set = set(symptom_input)

    top_k_results = []
    for disease, score in top_k_pairs:
        model = models[disease]           
        weights = model.coef_
        formatted_disease = format_disease_output(disease)               

        contributions = {
            symptom: weight * x_input.iloc[0, i]  # x_input is 0/1 features
            for i, (symptom, weight) in enumerate(zip(symptom_columns, weights))
        }

        matching_symptoms = [
            sym for sym, val in contributions.items() 
            if val > 0 and sym in user_selected_set
        ]
        matching_symptoms = [format_symptom(sym) for sym in matching_symptoms]

        top_k_results.append({
            "disease": formatted_disease,
            "risk_score": round(score * 100),
            "symptoms": matching_symptoms
        })

    return top_k_results