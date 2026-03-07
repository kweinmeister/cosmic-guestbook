<!-- markdownlint-disable MD033 MD041 -->
<div align="center">
  <h1>✨ Cosmic Guestbook</h1>
  <p><i>Leave your mark on the universe.</i></p>

  [![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
  [![Google Cloud](https://img.shields.io/badge/Google_Cloud-Deployed-4285F4?style=flat&logo=googlecloud)](https://cloud.google.com/)
  [![Biome](https://img.shields.io/badge/Biome-Linter_&_Formatter-60A5FA?style=flat&logo=biome)](https://biomejs.dev/)
</div>

<br />

A full-stack modern web application featuring an interactive guestbook
interface. Seamlessly deployed to **Google Cloud Run** via an automated CI/CD
pipeline using **Google Cloud Build** and **Google Cloud Deploy**.

## 🚀 Application Architecture

The application is logically separated between its
[**Frontend**](./frontend/) and [**Backend**](./backend/).

The React single-page frontend is powered by Vite and provides the
primary interactive user interface for the guestbook. The Express.js backend
serves both the in-memory guestbook API (`/api/entries`) and the
compiled static frontend assets.

The backend fundamentally integrates with **Google Vertex AI (Gemini)** to
offer intelligent features. Visitors will encounter real-time auto-replies
to new guestbook entries from "Station Zenith AI," along with generated
contextual summaries of recent transmissions.

We leverage OpenFeature alongside a GO Feature Flag provider to dynamically
toggle these AI features safely using [flags.yaml](./flags.yaml) without
initiating a new deployment.

## 🛳️ Deployment & CI/CD Pipeline

The deployment pipeline is fully orchestrated using a modern Google Cloud stack.

> [!IMPORTANT]
> **IAM Requirements**: Cloud Build executes using its default service account. Because this pipeline natively integrates with Cloud Deploy, you **must** grant the Cloud Build service account (`[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com`) the following IAM roles:
>
> * `roles/clouddeploy.deliveryPipelineEditor` (Allows creating and modifying delivery pipelines)
> * `roles/clouddeploy.targetEditor` (Allows creating and modifying targets)
> * `roles/clouddeploy.releaser` (Allows creating releases and rollouts)
> * `roles/iam.serviceAccountUser` (Allows Cloud Build to act as the default compute account to run the application)
>
> You can optionally apply these on standard project setup via Terraform, or manually execute the `gcloud projects add-iam-policy-binding` command.

[cloudbuild.yaml](./cloudbuild.yaml) drives the continuous integration,
executing dependencies installation, codebase linting with Biome, and
evaluating Vitest/Jest test suites with coverage.

[skaffold.yaml](./skaffold.yaml) compiles the container images directly from
the source code without a Dockerfile and prepares manifests for staging.

[clouddeploy.yaml](./clouddeploy.yaml) actively drives the continuous
delivery process, initiating canary deployments (50% traffic splitting) out
to the production Cloud Run environment.

[service.yaml](./service.yaml) defines the Cloud Run service, utilizing an
advanced multi-container sidecar pattern. The main node application runs
alongside a `go-feature-flag` sidecar container that efficiently retrieves
live feature flag configurations directly from `flags.yaml`.

> [!TIP]
> **Build Optimizations**: The repository includes both `.gcloudignore` and `.dockerignore` files. `gcloud builds submit` utilizes `.gcloudignore` for the initial Cloud Build upload, while the internal `gcloud deploy` step uses Skaffold, which strictly follows `.dockerignore`. Both are configured to exclude local `node_modules` folders, which keeps the deployment context size under 1MB and dramatically speeds up CI turnaround.

### 🧪 Testing the CI/CD Pipeline Locally

Developers can test the exact Cloud Build pipeline from their local machine before pushing to GitHub. Because the final deploy relies on the natively injected GitHub `$REPO_FULL_NAME` variable, you need to provide it via substitution during manual submissions:

```bash
gcloud beta builds submit --config=cloudbuild.yaml --substitutions=REPO_FULL_NAME="kweinmeister/cosmic-guestbook" .
```

## 🛠️ Local Development

To run the application locally, you can operate the backend and frontend
separately for hot-module reloading:

### 1. Start the Backend API

```bash
cd backend
npm install
npm start
```

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```

### Building for Production Locally

Alternatively, you can compile the frontend and serve it directly through
the Express backend using the top-level workspace scripts:

```bash
npm run gcp-build
npm start
```

## 🎛️ Managing Feature Flags

When running safely in local development, the backend reads feature flag
states directly from the local [flags.yaml](./flags.yaml) file. You can
dynamically toggle the AI features by modifying `defaultRule.variation`
to `enabled` or `disabled` within this configuration document.

> [!NOTE]
> In production, the Cloud Run sidecar pulls this file directly from the
> main branch of the GitHub repository to evaluate feature flags remotely,
> decoupling flags from code deployments.

### Available Flags

| Flag Key | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `cosmic-reply` | Boolean | `false` | Enables GenAI auto-replies from "Station Zenith AI" for new guestbook transmissions. |
| `cosmic-summary` | Boolean | `false` | Enables the GenAI aggregation widget that summarizes recent guestbook activity at the top of the feed. |
