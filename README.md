# CityGuards — Multi-Cloud Microservices & IaC Platform

<p align="left">
  <img src="https://img.shields.io/badge/Microsoft_Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white" alt="Microsoft Azure" />
  <img src="https://img.shields.io/badge/Google_Cloud_Firestore-4285F4?style=for-the-badge&logo=firebase&logoColor=white" alt="GCP Firestore" />
  <img src="https://img.shields.io/badge/Azure_Bicep_IaC-0078D4?style=for-the-badge&logo=azure-devops&logoColor=white" alt="Azure Bicep" />
  <img src="https://img.shields.io/badge/Azure_Functions-0062AD?style=for-the-badge&logo=azure-functions&logoColor=white" alt="Azure Functions" />
  <img src="https://img.shields.io/badge/GitHub_Actions_OIDC-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions OIDC" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Next.js_16.2.3-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16.2.3" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT" />
</p>

> **Fault-Tolerant Civic Reporting SaaS with Automated Cloud Infrastructure**  
> Modular multi-cloud microservices platform with strict transactional control (**ACID**), serverless event workers, automated **Azure AI Vision** moderation, and 100% Infrastructure as Code (**Azure Bicep**) deployed via **Zero-Secret GitHub Actions OIDC**.

---

## 🏛️ System Architecture & Multi-Cloud Topology

CityGuards implements a resilient, decoupled multi-cloud architecture spanning **Microsoft Azure** (compute, serverless event-driven processing, and media storage) and **Google Cloud Platform** (synchronous ACID state and real-time incident document persistence).

```mermaid
graph LR
    subgraph Client ["Client Layer"]
        A["Citizen Web App<br/>(Next.js / PWA)"]
    end

    subgraph Azure ["Microsoft Azure Cloud (Compute & AI)"]
        B["Azure App Service<br/>(Next.js REST API & SSR)"]
        C["Azure Blob Storage<br/>(occurrences-photos)"]
        D["Azure Functions App<br/>(AI Vision, Sharp & Karma)"]
    end

    subgraph GCP ["Google Cloud Platform (Persistence)"]
        E[("GCP Cloud Firestore<br/>(NoSQL ACID State)")]
    end

    A -->|"1. HTTPS Request"| B
    B -->|"2. Image Upload"| C
    C -->|"3. Blob Trigger"| D
    B -->|"4. Persistence & ACID Tx"| E
    D -->|"5. Update State & AI Metadata"| E
```

### 🧩 Core Component Layers

1. **Compute & Ingress (Microsoft Azure):**
   - **Azure App Service (Linux B1 SKU):** Hosts the containerized Next.js 16.2.3 (React 19) web application core, handling server-side rendering (SSR), API routes, and municipal management portals.
   - **Azure Blob Storage (`occurrences-photos` & `thumbnails`):** High-throughput storage tier with TLS 1.2 enforcement for evidence images.
2. **Serverless Event Processing (Azure Functions App):**
   - **`AnalyzeImageAI`:** Triggered upon blob creation; connects to **Azure AI Vision (Cognitive Services)** to extract visual tags, categorize incidents, and perform automated content moderation.
   - **`OptimizeImage`:** Generates high-efficiency WebP thumbnails using Sharp to optimize mobile payload delivery.
   - **`CalculateScore`:** Executes real-time gamification algorithms, computing citizen contribution karma and updating leaderboard rankings with ACID guarantees.
3. **Data Persistence Tier (Google Cloud Firestore):**
   - NoSQL document database providing atomic transaction batching, optimistic concurrency controls, and real-time synchronizations between citizen apps and municipal dashboards.
4. **Microservices (Dockerized Containers):**
   - **`pdf-service`:** Standalone Express microservice packaged in Docker for on-demand generation of formal municipal incident dossiers.

---

## 🏗️ Infrastructure as Code (Azure Bicep)

All cloud infrastructure is strictly codified in modular **Azure Bicep** templates located in [`infra/main.bicep`](infra/main.bicep), eliminating manual configuration drift and enabling deterministic environment provisioning:

```bicep
/* =====================================================================
   CityGuards — Azure Bicep Infrastructure as Code (IaC)
   Provisioned Resources:
   - Azure App Service Plan & Web App (Linux Next.js Runtime)
   - Azure Storage Account (occurrences-photos & thumbnails containers)
   - Azure Cognitive Services (ComputerVision AI moderation)
   - Azure Function App (Serverless Blob Triggered Workers)
   ===================================================================== */

@description('Unique environment prefix for all resource identifiers.')
param prefix string = 'cityguards'

@description('Azure deployment region.')
param location string = resourceGroup().location

@description('App Service SKU tier.')
param appServiceSku string = 'B1'

// Dynamic deterministic resource naming
var uniqueSuffix = uniqueString(resourceGroup().id)
var storageAccountName = '${prefix}store${substring(uniqueSuffix, 0, 6)}'
var appServicePlanName = '${prefix}-asp-${uniqueSuffix}'
var webAppName = '${prefix}-web-${uniqueSuffix}'
var functionAppName = '${prefix}-func-${uniqueSuffix}'
var cognitiveServiceName = '${prefix}-ai-${uniqueSuffix}'

// 1. Storage Account & Containers
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}
```

---

## 🔐 Zero-Secret CI/CD Pipeline (GitHub Actions & OIDC)

Security is enforced at the platform level by eliminating long-lived static credentials. The CI/CD pipeline ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) utilizes **Azure Federated OpenID Connect (OIDC)** and Workload Identity to authenticate deployments:

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer / Git Push
    participant GHA as GitHub Actions Runner
    participant OIDC as GitHub OIDC Token Provider
    participant Entra as Microsoft Entra ID (Azure AD)
    participant Azure as Azure Resource Manager (Bicep)

    Dev->>GHA: Git push to main branch
    GHA->>OIDC: Request Short-Lived JWT ID Token
    OIDC-->>GHA: Return Signed JWT Token
    GHA->>Entra: Authenticate via OIDC Federated Credential
    Entra->>Entra: Validate Audience (api://AzureADTokenExchange) & Subject (repo:RafaCr3z/cityguards-platform-core)
    Entra-->>GHA: Grant Ephemeral Azure Access Token (1 hour validity)
    GHA->>Azure: Deploy Bicep IaC & Publish Container to App Service
```

### CI/CD Pipeline Stages:
1. **Quality & Linting:** Automated ESLint and TypeScript compile checks.
2. **IaC Validation:** `az bicep build` syntax verification and ARM template linting.
3. **Container Security Scan:** Vulnerability scanning with **Aqua Security Trivy** (configured with `exit-code: '0'` in non-blocking informational mode for vulnerability visibility).
4. **Federated Cloud Deployment & Dry-Run Mode:**
   - **Dry-Run Mode (Default):** When Azure OIDC secrets are not set in the repository, the workflow executes a safe Bicep compilation dry-run (`az bicep build --outfile main.compiled.json`) to validate template integrity without cloud provisioning.
   - **Active Deployment:** When federated OIDC secrets (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`) are configured, the workflow provisions Azure resources via `azure/arm-deploy@v2`. A green CI check confirms successful code, container, and template compilation, but does not indicate that live Azure resources were provisioned unless OIDC secrets were supplied.

---

## 🔄 Event-Driven Incident Lifecycle Flow

```mermaid
flowchart TD
    A["📱 Citizen Submits Occurrence + Photo"] --> B["☁️ Next.js Web API (Azure App Service)"]
    B --> C["💾 Persist Metadata to GCP Firestore (ACID Tx)"]
    B --> D["📦 Upload Raw Image to Azure Blob Storage"]
    
    D -->|"BlobCreated Event"| E["⚡ Azure Function: OptimizeImage"]
    D -->|"BlobCreated Event"| F["⚡ Azure Function: AnalyzeImageAI"]
    
    E --> G["🖼️ Store WebP Thumbnail in Storage"]
    F --> H["🧠 Azure AI Vision (Cognitive Services)"]
    H -->|"Confidence & Tags"| I["📝 Auto-Tag Occurrence Category"]
    
    I --> J["⚡ Azure Function: CalculateScore"]
    J --> K["🏆 Update User Karma & Gamification Leaderboard in Firestore"]
```

---

## 📂 Repository Structure

```text
cityguards-platform-core/
│
├── .github/
│   └── workflows/
│       └── deploy.yml             # CI/CD Pipeline: OIDC Auth, Bicep Deploy & Security Scan
│
├── infra/
│   └── main.bicep                 # 100% Codified Azure Cloud Infrastructure
│
├── azure-functions/               # Serverless Event-Driven Workers
│   ├── AnalyzeImageAI/            # Azure AI Vision integration & moderation
│   ├── CalculateScore/            # Gamification algorithm & score calculator
│   └── OptimizeImage/             # Image compression & thumbnail generator
│
├── pdf-service/                   # Containerized PDF Export Microservice
│   ├── Dockerfile                 # Microservice container definition
│   └── server.js                  # PDF rendering engine
│
├── app/                           # Next.js 16.2 Core Application & API Routes
├── lib/                           # Shared utilities, Firestore client & Azure SDKs
├── public/                        # Static assets & branding
│
├── docs/                          # Architecture diagrams & technical specifications
│   └── architecture.svg           # High-resolution multi-cloud topology diagram
│
├── .dockerignore                  # Docker exclusion rules
├── .env.example                   # Environment configuration template (root)
├── .gitignore                     # Git exclusion rules
├── Dockerfile                     # Main application container image
├── package.json                   # Node.js dependencies (Next.js 16.2.3, React 19)
└── README.md                      # Platform documentation
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
* **Node.js:** v20+ LTS
* **Docker & Docker Compose**
* **Azure CLI:** `az` with `bicep` extension
* **Firebase / GCP Account** (for Firestore credentials)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/RafaCr3z/cityguards-platform-core.git
cd cityguards-platform-core
cp .env.example .env.local
```
> *.env.example is provided in the repository root without secrets, detailing Firebase credentials, Azure Blob Connection String, and Cognitive Services endpoints.*

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
*Application available at:* `http://localhost:3000`

### 4. Deploy Infrastructure with Azure Bicep (Manual Option)
```bash
az login
az group create --name rg-cityguards-dev --location westeurope
az deployment group create \
  --resource-group rg-cityguards-dev \
  --template-file infra/main.bicep \
  --parameters prefix=cityguards appServiceSku=B1
```

---

## 👥 Authors, Team Credits & Academic Evolution

### Academic Context & Team Responsibilities
* **Curricular Unit:** Cloud Computing (*Computação em Nuvem*) — 3rd Year, B.Sc. in Computer Engineering (Escola Superior de Tecnologia de Castelo Branco — IPCB, Grade: **20 / 20**).
* **Advisor / Professor:** Prof. Dr. Osvaldo Santos.
* **Academic Project Team & Original Division of Work:**
  - **Rafael Cruz** ([LinkedIn](https://linkedin.com/in/rafael-cruz-7159092b2) | [GitHub](https://github.com/RafaCr3z)) — **Backend, Data Persistence & Containerization:** Designed the persistence layer, GCP Cloud Firestore integration, atomic transaction logic with ACID guarantees (`db.runTransaction`), and multi-stage Docker containerization for the core application and standalone `pdf-service` microservice.
  - **Tiago Alves** — **Cloud Infrastructure & IaC (Academic Delivery):** Authored the original **Azure Bicep** Infrastructure as Code templates and Azure resource provisioning strategy in the academic submission.
  - **Diogo Oliveira** — **Frontend & Serverless Integration:** Developed the client interface and serverless workflow integrations.

### Post-Academic Evolution (Implemented by Rafael Cruz in this Repository)
* **Full-Stack Consolidation:** Migrated the original academic split prototype (Node.js/Express + React/Vite) into a unified **Next.js 16.2.3 (App Router)** architecture while maintaining the multi-cloud topology.
* **DevSecOps CI/CD & IaC Automation ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) & [`infra/main.bicep`](infra/main.bicep)):** Adapted the Bicep template for automated CI validation (`az bicep build` dry-run mode) and engineered the **Zero-Secret GitHub Actions CI/CD pipeline** with **Azure OIDC federated authentication** and **Aqua Trivy** container scanning as a post-coursework evolution.

---
<p align="center">
  <sub>Engineered for reliability, multi-cloud scalability, and automated cloud operations.</sub>
</p>
