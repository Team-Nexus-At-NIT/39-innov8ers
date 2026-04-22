@echo off
cd /d "%~dp0"
echo ===================================================
echo Installing Agri-Chatbot Dependencies
echo ===================================================
echo.
echo [IMPORTANT] This will download PyTorch and other AI libraries.
echo This may take a few minutes (approx 1-2 GB).
echo Please do NOT close this window until it finishes.
echo.

python -m pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Installation failed.
    pause
    exit /b
)

echo.
echo [SUCCESS] Dependencies installed!
echo You can now run start_chatbot.bat
echo.
pause
