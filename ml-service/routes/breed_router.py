from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from predictors.predict_breed import predict_breed_from_bytes

router = APIRouter()

@router.post("/predict")
async def predict_breed_endpoint(file: UploadFile = File(...)):
    # Read the uploaded file in memory
    file_bytes = await file.read()
    result = predict_breed_from_bytes(file_bytes)
    return JSONResponse(result)