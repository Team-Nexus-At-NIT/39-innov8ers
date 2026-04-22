@echo off
cd /d "%~dp0"

echo Starting Agri-Chatbot Backend...

REM Check for Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python not found! Please install Python.
    pause
    exit /b
)

REM Check if uvicorn is installed (simple check)
python -c "import uvicorn" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Dependencies not found.
    echo Please run 'install_dependencies.bat' first!
    pause
    exit /b
)

echo Starting Server...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
