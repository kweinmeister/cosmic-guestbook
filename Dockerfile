FROM node:25-slim
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies first (to leverage Docker layer caching)
RUN npm install --prefix frontend && npm install --prefix backend

# Copy the remaining project files
COPY . .

# Build frontend assets now that the source code is present
RUN npm run build --prefix frontend

# Set environment explicitly for execution
ENV NODE_ENV=production

# Start the Express server
CMD ["npm", "start"]
