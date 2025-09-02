@echo off
echo Starting Macroverse...

REM Check if virtual environment exists
if not exist "venv" (
    echo Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Set Python path to include current directory
set PYTHONPATH=%PYTHONPATH%;.

REM Change to python directory and run main.py
cd python
python main.py

REM Return to original directory
cd ..

echo.
echo Macroverse stopped.
pause
