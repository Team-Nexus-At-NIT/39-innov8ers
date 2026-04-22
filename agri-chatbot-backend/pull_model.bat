@echo off
echo ===================================================
echo Pulling AI Model (Gemma 2B)
echo ===================================================
echo.

REM Try running ollama directly
ollama pull gemma:2b
if %ERRORLEVEL% EQU 0 goto :success

REM Try common install path (User)
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
    "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" pull gemma:2b
    if %ERRORLEVEL% EQU 0 goto :success
)

REM Try common install path (System)
if exist "C:\Program Files\Ollama\ollama.exe" (
    "C:\Program Files\Ollama\ollama.exe" pull gemma:2b
    if %ERRORLEVEL% EQU 0 goto :success
)

echo.
echo [ERROR] Could not find 'ollama' command.
echo Please ensure Ollama is installed and running!
echo Download from: https://ollama.com
pause
exit /b

:success
echo.
echo [SUCCESS] Model downloaded!
echo You can now restart start_chatbot.bat
pause
