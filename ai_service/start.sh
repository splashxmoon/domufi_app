#!/bin/bash

echo "Starting Domufi AI Service..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
echo "Checking dependencies..."
pip install -q -r requirements.txt

# Start the service
echo ""
echo "Starting AI Service on http://localhost:8000"
echo ""
python main.py
