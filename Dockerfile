# ==============================
# Stage 1: Build the application
# ==============================
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies separately to leverage Docker caching
COPY frontend/package*.json backend/package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies for frontend
WORKDIR /app/frontend
RUN npm ci

# Install dependencies for backend
WORKDIR /app/backend
RUN npm ci

# Copy source code
COPY frontend /app/frontend
COPY backend /app/backend

# Build frontend
WORKDIR /app/frontend
RUN npm run build --prod && \
    mv dist/healthcare-portal/browser/index.csr.html dist/healthcare-portal/browser/index.html

# Install TypeScript globally
RUN npm install -g typescript

# Build backend (Compile TypeScript)
WORKDIR /app/backend
RUN tsc

# ==============================
# Stage 2: Create minimal runtime image
# ==============================
FROM node:18-alpine

WORKDIR /app

# Install PM2 globally for process management
RUN npm install -g pm2

# Copy only necessary files from the builder stage
COPY --from=builder /app/frontend/dist/healthcare-portal/browser /app/frontend
COPY --from=builder /app/backend/dist /app/backend
COPY --from=builder /app/backend/package*.json /app/backend/

# Install only production dependencies for backend
WORKDIR /app/backend
RUN npm ci --only=production

# Expose required ports
EXPOSE 4200 3000

# Start both frontend and backend using PM2
CMD pm2 start /app/backend/server.js --name "backend" && pm2 serve /app/frontend 4200 --name "frontend" && pm2 logs
