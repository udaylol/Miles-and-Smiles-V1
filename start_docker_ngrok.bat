@echo off
title Miles and Smiles - Docker + Ngrok Mode

echo ============================================
echo      STARTING DOCKER + NGROK MODE
echo ============================================

echo Stopping existing container...
docker stop miles-and-smiles-container >nul 2>&1

echo Removing old container...
docker rm miles-and-smiles-container >nul 2>&1

echo.
echo Building new Docker image...
docker build -t miles-and-smiles .

echo.
echo Running Docker container...
docker run -d -p 5000:5000 --name miles-and-smiles-container miles-and-smiles

echo.
echo Starting Ngrok tunnel on port 5000...
start /B ngrok http 5000 >nul 2>&1

echo Waiting for Ngrok to initialize...
timeout /t 4 >nul

echo Fetching public Ngrok URL...
for /f "tokens=2 delims=:," %%A in ('curl -s http://127.0.0.1:4040/api/tunnels ^| findstr /i "public_url"') do (
    set NGROK_URL=%%A
)

REM Remove extra quotes
set NGROK_URL=%NGROK_URL:"=%

echo Ngrok Public URL:
echo %NGROK_URL%

echo.
echo Opening frontend URL...
start %NGROK_URL%/auth

echo.
echo ============================================
echo      SHOWING DOCKER CONTAINER LOGS
echo Press CTRL + C to stop logs
echo ============================================
docker logs -f miles-and-smiles-container
