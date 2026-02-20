from fastapi import FastAPI
from routes import breed_router as breed

app = FastAPI(title="ML Service")

# Include routers
app.include_router(breed.router, prefix="/breed", tags=["Breed Detection"])
@app.get("/")
def read_root():
    return {"message": "Welcome to the ML Service API!"}