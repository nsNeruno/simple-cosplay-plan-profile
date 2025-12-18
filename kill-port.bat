@echo off
setlocal ENABLEDELAYEDEXPANSION

:: Prompt user for port
set /p PORT=Enter port number to kill: 

if "%PORT%"=="" (
    echo No port provided. Exiting.
    exit /b 1
)

echo Searching for processes using port %PORT%...
echo.

:: Find PIDs using the port
for /f "tokens=5" %%A in ('netstat -ano ^| findstr :%PORT%') do (
    echo Killing process with PID %%A on port %PORT%
    taskkill /PID %%A /F >nul 2>&1
)

echo.
echo Done.
pause
