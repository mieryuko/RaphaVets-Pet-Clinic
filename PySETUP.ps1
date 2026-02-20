<#
.SYNOPSIS
Setup Python virtual environment and install dependencies for ml-service.

Usage:
    1. Open PowerShell anywhere.
    2. Run: .\PySETUP.ps1
#>

# Stop script on any error
$ErrorActionPreference = "Stop"

# Step 0: Make sure project folder exists
$projectFolder = "ml-service"

Write-Host "0: Ensuring project folder '$projectFolder' exists..." -ForegroundColor Cyan
if (-Not (Test-Path ".\$projectFolder")) {
    New-Item -ItemType Directory -Path $projectFolder
    Write-Host "Folder '$projectFolder' created." -ForegroundColor Green
} else {
    Write-Host "Folder '$projectFolder' already exists. Skipping creation." -ForegroundColor Yellow
}

#Change directory to project
Set-Location -Path ".\$projectFolder"
Write-Host "Changed directory to '$projectFolder'" -ForegroundColor Cyan

# Step 1: Create virtual environment if missing
Write-Host "1: Creating virtual environment..." -ForegroundColor Cyan
if (-Not (Test-Path ".\venv")) {
    python -m venv venv
    Write-Host "Virtual environment created in ./venv" -ForegroundColor Green
} else {
    Write-Host "Virtual environment already exists. Skipping creation." -ForegroundColor Yellow
}

# Step 2: Activate virtual environment
Write-Host "2: Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Step 3: Upgrade pip, setuptools, and wheel
Write-Host "3: Upgrading pip, setuptools, and wheel..." -ForegroundColor Cyan
python -m pip install --upgrade pip setuptools wheel

# Step 4: Install dependencies
Write-Host "4: Installing dependencies from requirements.txt..." -ForegroundColor Cyan
if (Test-Path ".\requirements.txt") {
    pip install -r requirements.txt
    Write-Host "Dependencies installed successfully." -ForegroundColor Green
} else {
    Write-Host "!!!  requirements.txt not found! Please create it before running this script." -ForegroundColor Red
}

# Step 5: Verify FastAI installation (lightweight)
Write-Host "5: Verifying FastAI installation..." -ForegroundColor Cyan

$verifyScript = @"
from fastai.vision.all import *
from fastai.data.external import URLs, untar_data

# Download tiny MNIST_SAMPLE dataset (small)
path = untar_data(URLs.MNIST_SAMPLE)

# Create a small dataloader
dls = ImageDataLoaders.from_folder(path, bs=16)

# Create learner (does NOT train)
learn = vision_learner(dls, resnet18, metrics=accuracy)

print('FastAI imports, data loaders, and learner creation work!')
"@

# Run the verification in the virtual environment
& .\venv\Scripts\python.exe -c $verifyScript


Write-Host "Setup complete! Virtual environment is ready." -ForegroundColor Green
Write-Host "To activate in the future, run: .\venv\Scripts\Activate.ps1"
