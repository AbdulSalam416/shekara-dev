# Project CI/CD Workflow

This document outlines the specific CI/CD pipeline for this monorepo project, covering Git workflow, Dockerization, testing, and deployment for the different applications.

## 1. Git Workflow: Feature Branch Strategy

We will use a simple and effective feature-branch workflow.

- **`main` branch**: This branch represents the production-ready code. Direct pushes to `main` are prohibited.
- **Feature branches**: All new work (features, bug fixes) must be done on a feature branch.
    - Branches should be created from the `main` branch.
    - Naming convention: `feature/<ticket>-<short-description>` (e.g., `feature/TICKET-123-add-user-auth`) or `fix/<ticket>-<short-description>`.
- **Pull Requests (PRs)**:
    - When a feature is complete, a Pull Request is opened to merge the feature branch into `main`.
    - PRs trigger the Continuous Integration (CI) pipeline.
    - At least one code review from another team member is required for a PR to be merged.
    - The PR must pass all CI checks before it can be merged.

---

## 2. Continuous Integration (CI) Pipeline

The CI pipeline is triggered on every push to a feature branch that has an open PR against `main`. This ensures that code is validated before being merged.

The CI pipeline will be defined in a file like `.github/workflows/ci.yml`.

### CI Stages:

1.  **Checkout Code**:
    - The CI server checks out the code from the feature branch.

2.  **Setup Environment**:
    - Install Node.js, pnpm, Python, and other required tools.
    - Install dependencies for all workspaces (`pnpm install`).

3.  **Linting and Formatting**:
    - **JavaScript/TypeScript**: Run `pnpm lint` to check all JS/TS applications and libraries (`llm-knowledge-graph`, `expo-playground`, `ui`).
    - **Python**: Run linting tools like `ruff` or `flake8` for the `ai-service`.

4.  **Testing**:
    - **JavaScript/TypeScript**: Run `pnpm test` to execute unit and integration tests for all workspaces. This will cover:
        - `libs/ui`
        - `apps/llm-knowledge-graph`
        - `apps/expo-playground`
    - **Python**: Run `pytest` for the `ai-service`.

5.  **Build Applications**:
    - **`llm-knowledge-graph` (Next.js)**: Run `pnpm build --filter=llm-knowledge-graph` to create a production build.
    - **`ui` library (Vite)**: Run `pnpm build --filter=ui` to build the shared component library.
    - **`ai-service` (Python)**: While there isn't a "build" step like with compiled languages, this stage will ensure all dependencies are installed and the application can be packaged.

6.  **Build Docker Images**:
    - If all previous stages pass, the pipeline will build Docker images for the services intended for containerized deployment.
    - **`ai-service`**: A `Dockerfile` in `apps/ai-service` will be used to build a Docker image for the Python FastAPI application.
    - **`llm-knowledge-graph`**: A `Dockerfile` in `apps/llm-knowledge-graph` will be used to build a Docker image for the Next.js application.

---

## 3. Continuous Deployment (CD) Pipeline

The CD pipeline is triggered automatically when a Pull Request is merged into the `main` branch.

### CD Stages:

1.  **Tag Release**:
    - A new Git tag is created to mark the release (e.g., `v1.2.3`). This can be automated.

2.  **Push Docker Images**:
    - The Docker images built in the CI stage are pushed to a container registry (e.g., Docker Hub, AWS ECR, Google Artifact Registry). The images will be tagged with the release version.

3.  **Deploy Services**:

    - **`llm-knowledge-graph` (Next.js App)**:
        - **Deployment Platform**: Vercel is recommended, as suggested by the `.vercel` directory in the project structure.
        - **Action**: A Vercel deployment can be automatically triggered on merge to `main` through the Vercel for GitHub integration. It will build and deploy the application.
        - **Alternative (Docker)**: If not using Vercel, the `llm-knowledge-graph` Docker image can be deployed to a container platform like AWS ECS, Google Cloud Run, or a Kubernetes cluster.

    - **`ai-service` (Python/FastAPI)**:
        - **Deployment Platform**: Any platform that supports Docker containers (e.g., AWS ECS, Google Cloud Run, Kubernetes, fly.io).
        - **Action**: The deployment pipeline will pull the new Docker image from the registry and deploy it as a container. This could involve updating a Kubernetes deployment configuration or a Cloud Run service definition.

    - **`expo-playground` (React Native App)**:
        - The deployment for the Expo mobile app is a separate process.
        - **Action**: To create a new build for testing or release, a developer can run `eas build` from their local machine or trigger a dedicated pipeline for it. This is typically a manual or semi-automated step and not part of the main backend/web CD pipeline.

4.  **Post-Deployment**:
    - **Run Smoke Tests**: After deployment, a simple set of automated tests should run against the live production URLs to ensure the main endpoints and pages are up and running.
    - **Monitoring**: The deployed applications should be monitored for errors and performance issues.

---
This workflow ensures that every change is automatically tested and, upon approval, deployed to production in a safe and consistent manner.
