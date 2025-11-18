# Step 1 — Build React frontend
FROM node:20 AS frontend-build

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/. .
RUN npm run build

# Step 2 — Backend + serve frontend
FROM node:20

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install

COPY backend/. .

# Copy frontend build into backend public folder
COPY --from=frontend-build /frontend/dist ./public

EXPOSE 5000

CMD ["npm", "start"]
