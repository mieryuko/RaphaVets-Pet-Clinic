from fastai.vision.all import load_learner
from PIL import Image
import numpy as np
from pathlib import Path
from io import BytesIO
from fastapi import HTTPException

ml_service_root = Path(__file__).resolve().parents[1]
MODEL_PATH = str(ml_service_root / "models" / "breed_model.pkl")

learn = None
model_load_error = None


def get_learner():
    global learn, model_load_error

    if learn is not None:
        return learn

    if model_load_error is not None:
        raise HTTPException(
            status_code=500,
            detail=f"Model failed to load: {model_load_error}",
        )

    try:
        # ------------------------------
        # Patch WindowsPath for Linux
        # ------------------------------
        import pickle
        from pathlib import PureWindowsPath, Path

        class WindowsPathFix(PureWindowsPath):
            def __new__(cls, *args, **kwargs):
                return Path(*args)

        _pickle_load_orig = pickle.load

        def patched_pickle_load(f, *args, **kwargs):
            return _pickle_load_orig(f, *args, **kwargs)

        pickle.load = patched_pickle_load
        # ------------------------------

        # Load the learner
        learn = load_learner(MODEL_PATH)
        # Optionally, re-export to fix paths permanently
        learn.export(MODEL_PATH)

        return learn
    except Exception as error:
        model_load_error = str(error)
        print("ML model load error:", error)
        raise HTTPException(
            status_code=500,
            detail=f"Model failed to load: {model_load_error}",
        )

def predict_breed_from_bytes(file_bytes: bytes) -> dict:
    try:
        """
        Predicts the breed from an image in memory (bytes).
        No disk I/O needed.
        """
        # Convert bytes to PIL Image
        img = Image.open(BytesIO(file_bytes))
        learner = get_learner()
        
        # Predict
        pred_class, pred_idx, probs = learner.predict(np.array(img))

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
    except Exception as e:
        print("ML prediction error:", e)
        raise HTTPException(status_code=500, detail="Prediction failed due to server error.")
