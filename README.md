# Cosmic Guestbook

A full-stack Node.js and React application featuring a guestbook interface, deployed to Google Cloud Run via an automated CI/CD pipeline using Google Cloud Build.

## Application Structure

- **Frontend**: A React single-page application built with Vite. It provides the user interface for the guestbook.
- **Backend**: An Express.js API serving an in-memory guestbook (handling `GET` and `POST` at `/api/entries`) and serving the static frontend build.

## CI/CD Pipeline

The project uses Google Cloud Build (`cloudbuild.yaml`) for Continuous Integration. The pipeline currently includes steps to:
1. **Backend Integration & Testing**: Runs `npm ci`, `npm run lint`, and `npm run test` on the Node 20 environment.
2. **Frontend Integration & Testing**: Runs `npm ci`, `npm run lint`, and `npm run test` (via Vitest) on the Node 20 environment.

## Running Locally

To run the application locally, you can start the backend and frontend separately:
- **Backend**: `cd backend && npm install && node server.js` (runs on port 8080)
- **Frontend**: `cd frontend && npm install && npm run dev` (runs Vite dev server)

Alternatively, you can build the frontend and serve it through the backend by using the top-level script:
```bash
npm run gcp-build
npm start
```