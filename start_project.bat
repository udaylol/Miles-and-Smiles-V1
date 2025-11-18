@echo off

start cmd /k "cd backend && npm run dev"
start cmd /k "ngrok http 5000"
start cmd /k "cd frontend && npm run dev"
