@echo off
title Miles and Smiles - Docker Mode

echo ============================================
echo    STARTING MILES AND SMILES IN DOCKER
echo ============================================

REM Stop old container if any
echo Stopping any existing containers...
docker stop miles-and-smiles-container >nul 2>&1

REM Remove old container
echo Removing old container...
docker rm miles-and-smiles-container >nul 2>&1

REM OPTIONAL: Remove old image (uncomment if needed)
REM echo Removing old Docker image...
REM docker rmi miles-and-smiles >nul 2>&1

echo.
echo Building new Docker image...
docker build -t miles-and-smiles .

echo.
echo Running Docker container...
docker run -d -p 5000:5000 --name miles-and-smiles-container miles-and-smiles

echo.
echo Opening website in browser...
start http://localhost:5000/auth

echo.
echo Showing container logs:
echo Press CTRL + C to stop logs (container stays running)
echo ============================================
docker logs -f miles-and-smiles-container
