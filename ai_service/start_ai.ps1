Write-Host "🚀 Starting Domufi AI Service..." -ForegroundColor Green
Write-Host ""

# Navigate to ai_service directory (adjust path if needed)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check Python installation
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing/updating dependencies..." -ForegroundColor Yellow
pip install -q -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Start the service
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 Domufi AI Service Starting..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Service URL: http://localhost:8000" -ForegroundColor White
Write-Host "📚 API Docs:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "❤️  Health Check: http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  First startup may take 30-60 seconds to load ML models" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press CTRL+C to stop the service" -ForegroundColor Gray
Write-Host ""

# Run the service
python main.py
