# Domufi AI Service Setup Script
Write-Host "🚀 Setting up Domufi AI Service..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.9+ first." -ForegroundColor Red
    exit 1
}

# Navigate to ai_service directory
Set-Location $PSScriptRoot

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet

# Install dependencies
Write-Host "Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Supabase Configuration
SUPABASE_URL=https://piterhtecxxktnxbldmz.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdGVyaHRlY3h4a3RueGJsZG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjA5MjEsImV4cCI6MjA2ODYzNjkyMX0.rEUfb2BFDiTdTOtalgtS519xSPH8GejBgQYGhQITly0

# Learning Configuration
ENABLE_LEARNING=true
MAX_MEMORY_SIZE=10000

# Model Configuration
USE_LOCAL_MODELS=true
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the AI service, run:" -ForegroundColor Cyan
Write-Host "  python main.py" -ForegroundColor White
Write-Host ""
Write-Host "Or use the start script:" -ForegroundColor Cyan
Write-Host "  .\start.bat" -ForegroundColor White
Write-Host ""
