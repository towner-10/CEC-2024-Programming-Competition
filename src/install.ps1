# Run ./script/gui/csv_parser.py to generate gui_data.json and copy that output to ./frontend/src/assets/gui_data.json
# Get the current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Check Python version
$pythonVersion = python --version
if ($pythonVersion -like "Python 3.12*") {
    Write-Host "Python 3.12 is installed"
} else {
    Write-Host "Python 3.12 is not installed"
    return
}

# Check node version
$nodeVersion = node --version
if ($nodeVersion -like "v20*") {
    Write-Host "Node v20 is installed"
} else {
    Write-Host "Node v20 is not installed"
    return
}

# Install required packages
pip install -r $scriptPath/scripts/requirements.txt

# Push to the correct directory
cd $scriptPath/scripts/gui

# Run the csv_parser.py
python csv_parser.py

cd $scriptPath

# Copy the gui_data.json to the frontend
Copy-Item $scriptPath/scripts/gui/gui_data.json $scriptPath/frontend/src/assets/gui_data.json

# Run the pathfinder script
cd $scriptPath/scripts/pathfinder
python pathfinder.py

# Install the frontend packages
cd $scriptPath/frontend
npm install

# Start development server
npm run dev

cd $scriptPath
