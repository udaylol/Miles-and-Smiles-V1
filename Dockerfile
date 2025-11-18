# -------------------------------
# STEP 1 — Build React Frontend
# -------------------------------
FROM node:20 AS frontend-build

WORKDIR /frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy all frontend files
COPY frontend/. .

# Build React (Vite)
RUN npm run build



# -------------------------------
# STEP 2 — Backend + Serve Frontend
# -------------------------------
FROM node:20

WORKDIR /app

# Docker and production environment
ENV NODE_ENV=production
ENV DOCKER_ENV=true

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY backend/. .

# Copy frontend build to backend public folder
COPY --from=frontend-build /frontend/dist ./public

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["npm", "start"]

