FROM node:26-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

FROM node:26-slim AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install --omit=dev --prefix backend

FROM node:26-slim
WORKDIR /app
ENV NODE_ENV=production

COPY backend/ ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY package.json ./
COPY flags.yaml ./

CMD ["node", "backend/server.js"]
