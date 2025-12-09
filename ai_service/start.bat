@echo off
echo Starting Domufi AI Service...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies if needed
echo Checking dependencies...
pip install -q -r requirements.txt

REM Start the service
echo.
echo Starting AI Service on http://localhost:8000
echo.
python main.py

pause
