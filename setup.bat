@echo off
echo Setting up Macroverse for Windows...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.8+ from https://python.org
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

echo Python found!
echo.

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Failed to create virtual environment.
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install required packages
echo Installing required packages...
pip install moderngl-window numpy python-osc mido

REM Check if installation was successful
if %errorlevel% neq 0 (
    echo Failed to install required packages.
    pause
    exit /b 1
)

echo.
echo Setup complete! 
echo.
echo To run Macroverse:
echo 1. Open a command prompt in this directory
echo 2. Run: run.bat
echo.
pause
