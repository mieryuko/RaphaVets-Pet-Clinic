from fastapi import FastAPI
from routes import breed_router as breed
from routes import dog_disease_router as dog_disease

app = FastAPI(title="ML Service")

# Include routers
app.include_router(breed.router, prefix="/breed", tags=["Breed Detection"])
app.include_router(dog_disease.router, prefix="/disease", tags=["Dog Disease Prediction"])
@app.get("/")
def read_root():
    return {"message": "Welcome to the ML Service API!"}