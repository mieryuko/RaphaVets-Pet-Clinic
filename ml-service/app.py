from fastapi import FastAPI
from routes import breed_router as breed
from routes import disease_router as disease
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ML Service")

# Print versions (for debugging)
print("fastai:", fastai.__version__)
print("torch:", torch.__version__)
print("torchvision:", torchvision.__version__)
print("scikit-learn:", sklearn.__version__)
print("numpy:", numpy.__version__)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust origins as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(breed.router, prefix="/predict_breed", tags=["Breed Detection"])
app.include_router(disease.router, prefix="/predict_disease", tags=["Disease Prediction"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the ML Service API!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/ready")
def readiness_check():
    """Return 200 only when required models are loaded."""
    from pathlib import Path
    model_dir = Path(__file__).resolve().parents[0] / "models"
    expected = [
        model_dir / "breed_model.pkl",
        model_dir / "dog_diagnostic_model.pkl",
        model_dir / "dog_diagnostic_scaler.pkl",
    ]
    missing = [p.name for p in expected if not p.exists()]
    if missing:
        return {"status": "loading", "missing": missing}
    return {"status": "ready"}