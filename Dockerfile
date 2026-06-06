# Stage 1: Frontend Builder
FROM node:26-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# Stage 2: Backend Builder (production dependencies only)
FROM node:26-slim AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install --omit=dev --prefix backend

# Stage 3: Final Runner
FROM node:26-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy only runtime resources
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY package.json ./
COPY flags.yaml ./

# Start the application directly with Node.js to avoid npm runtime overhead
CMD ["node", "backend/server.js"]
