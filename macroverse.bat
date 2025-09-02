@echo off
echo ========================================
echo    MACROVERSE - Interactive Shader Lab
echo ========================================
echo.
echo Choose your interface:
echo.
echo 1. Main Application (Keyboard Controls)
echo 2. Shader Control GUI (Advanced Interface)
echo 3. View Shader Guide
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" goto main_app
if "%choice%"=="2" goto gui_app  
if "%choice%"=="3" goto guide
goto invalid

:main_app
echo.
echo Starting Macroverse with Keyboard Controls...
echo ============================================
echo.
echo CONTROLS:
echo   1-6: Switch Shaders
echo   Q/A: Time Scale    W/S: Audio Sensitivity
echo   E/D: Zoom          R/F: Brightness  
echo   T/G: Ripple Freq   Y/H: Ripple Speed
echo   ESC: Exit
echo.
call venv\Scripts\activate.bat
cd python
python main.py
cd ..
goto end

:gui_app
echo.
echo GUI Control Interface (Advanced Shader Controls!)
echo For now, use the keyboard controls in option 1.
echo.
pause
goto end

:guide
echo.
echo Opening Shader Guide...
if exist "SHADER_GUIDE.md" (
    start "" "SHADER_GUIDE.md"
) else (
    echo Guide not found! Please check SHADER_GUIDE.md
)
pause
goto end

:invalid
echo Invalid choice! Please select 1, 2, or 3.
pause
goto end

:end
echo.
echo Thanks for using Macroverse!
pause
