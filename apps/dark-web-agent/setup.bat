@echo off
echo ============================================
echo Security Guardian Agent - Setup Script
echo ============================================
echo.

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [*] Python found!
python --version

echo.
echo [*] Installing dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Setup complete!
    echo.
    echo To run the agent:
    echo   python main.py
    echo.
    echo For interactive mode:
    echo   python main.py --interactive
    echo.
) else (
    echo.
    echo [ERROR] Failed to install dependencies
    echo Please check your internet connection and try again
)

pause
