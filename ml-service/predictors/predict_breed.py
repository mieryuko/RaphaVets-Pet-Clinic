from fastai.vision.all import load_learner
from PIL import Image
import numpy as np
from pathlib import Path
from io import BytesIO

ml_service_root = Path(__file__).resolve().parents[1]
MODEL_PATH = ml_service_root / "models" / "breed_model.pkl"

# Load the model once
learn = load_learner(MODEL_PATH)

def predict_breed_from_bytes(file_bytes: bytes) -> dict:
    """
    Predicts the breed from an image in memory (bytes).
    No disk I/O needed.
    """
    # Convert bytes to PIL Image
    img = Image.open(BytesIO(file_bytes))
    
    # Predict
    pred_class, pred_idx, probs = learn.predict(np.array(img))

    #Clean up the output for JSON response

    confidence = float(probs[pred_idx])
    breed = str(pred_class).title().replace('_', ' ')  # Capitalize breed name and replace underscores with spaces

    #Generate note based on confidence
    if confidence > 0.85:
        main_note = "Most likely a " + breed
    elif confidence > 0.6:
        main_note = "Possibly a " + breed
    else:
        main_note = "Uncertain, but could be a " + breed

    #confidence disclaimer
    disclaimer = "This is an AI prediction and may not be accurate. Please consult a veterinarian for a definitive diagnosis."
    note = f"{main_note}.\n{disclaimer}"

    return {
        "breed": breed,
        "confidence": confidence,
        "note": note
    }
