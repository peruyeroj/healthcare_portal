# Use Node.js as the base image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json for both frontend and backend
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies for frontend
WORKDIR /app/frontend
RUN npm install

# Install dependencies for backend
WORKDIR /app/backend
RUN npm install

# Copy the entire Angular project (including source code and assets)
COPY frontend /app/frontend
COPY backend /app/backend

# Build the Angular app in production mode
WORKDIR /app/frontend
RUN npm run build --prod

# Install 'serve' globally to serve the built app
RUN npm install -g serve

# Rename index.csr.html to index.html if necessary
RUN mv /app/frontend/dist/healthcare-portal/browser/index.csr.html /app/frontend/dist/healthcare-portal/browser/index.html || true

# Install TypeScript globally for backend compilation
RUN npm install -g typescript

# Compile TypeScript for the backend
WORKDIR /app/backend
RUN tsc

# Expose port 4200 for accessing the frontend and port 3000 for the backend
EXPOSE 4200 3000

# Install PM2 globally for process management
RUN npm install -g pm2

# Create a start script to run both frontend and backend concurrently
CMD pm2 start /app/backend/dist/server.js --name "backend" && pm2 serve /app/frontend/dist/healthcare-portal/browser 4200 --name "frontend" && pm2 logs
