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

Write-Host "0️⃣ Ensuring project folder '$projectFolder' exists..." -ForegroundColor Cyan
if (-Not (Test-Path ".\$projectFolder")) {
    New-Item -ItemType Directory -Path $projectFolder
    Write-Host "Folder '$projectFolder' created." -ForegroundColor Green
} else {
    Write-Host "Folder '$projectFolder' already exists. Skipping creation." -ForegroundColor Yellow
}

# Step 1: Change directory to project
Set-Location -Path ".\$projectFolder"
Write-Host "Changed directory to '$projectFolder'" -ForegroundColor Cyan

# Step 2: Create virtual environment if missing
Write-Host "1️: Creating virtual environment..." -ForegroundColor Cyan
if (-Not (Test-Path ".\venv")) {
    python -m venv venv
    Write-Host "Virtual environment created in ./venv" -ForegroundColor Green
} else {
    Write-Host "Virtual environment already exists. Skipping creation." -ForegroundColor Yellow
}

# Step 3: Activate virtual environment
Write-Host "2️: Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Step 4: Upgrade pip, setuptools, and wheel
Write-Host "3️: Upgrading pip, setuptools, and wheel..." -ForegroundColor Cyan
python -m pip install --upgrade pip setuptools wheel

# Step 5: Install dependencies
Write-Host "4️: Installing dependencies from requirements.txt..." -ForegroundColor Cyan
if (Test-Path ".\requirements.txt") {
    pip install -r requirements.txt
    Write-Host "Dependencies installed successfully." -ForegroundColor Green
} else {
    Write-Host "!!!  requirements.txt not found! Please create it before running this script." -ForegroundColor Red
}

Write-Host " Setup complete! Virtual environment is ready." -ForegroundColor Green
Write-Host "To activate in the future, run: .\venv\Scripts\Activate.ps1"
