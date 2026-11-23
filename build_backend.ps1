# Build the Python backend into a single executable using PyInstaller
# Prerequisites: Python 3.12+, pip, pyinstaller, ffmpeg binary placed at backend/ffmpeg/ffmpeg.exe

$ErrorActionPreference = 'Stop'

# Install Python dependencies
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt

# Install PyInstaller if not present
python -m pip install pyinstaller

# Run PyInstaller
pyinstaller --clean --onefile --add-data "backend\ffmpeg\ffmpeg.exe;ffmpeg" backend\server.py ^
    --name spotify_backend ^
    --distpath backend\dist ^
    --workpath backend\build ^
    --specpath backend

Write-Host "Backend built: backend\dist\spotify_backend.exe"
