# **AI Agent Platform: Architecture & System Design**

## 1. Introduction & Vision

Our vision is to create an intelligent, automated workforce that operates alongside human teams, amplifying their potential and driving a new era of operational excellence. Many organizations today are constrained by manual, repetitive processes that are not only inefficient but also stifle innovation and create friction for customers and employees alike.

The **AI Agent Platform** is our answer. It is a centralized, enterprise-grade solution designed for the creation, management, and deployment of autonomous AI agents. These agents act as dedicated digital team members, capable of executing complex workflows, making decisions, and interacting with enterprise systems to automate tasks from start to finish. We empower **Business Process Owners, IT Administrators, and Business Analysts** to transform their static workflows into dynamic, intelligent operations without requiring deep technical expertise.

To realize this vision, our platform is built on a foundation of key architectural principles that ensure power, flexibility, and scalability.

### **Our Architectural Philosophy**

*   **Modular & Scalable by Design:** We have chosen a **Hybrid Microservices Architecture** to achieve the perfect balance between development velocity and long-term scalability. A core service manages tightly-coupled business logic for rapid feature implementation, while specialized microservices handle distinct functions like agent management and notifications. This approach allows us to scale critical components independently, ensuring the platform remains robust and responsive as our customers' needs grow.

*   **AI-Agnostic & Future-Proof:** The core of our platform's intelligence is managed by a **dedicated, internal AI Service**. This architectural decision is paramount. By centralizing all AI-specific logic, prompt engineering, and model interactions, we provide our customers with ultimate flexibility. They are never locked into a single Large Language Model (LLM) provider. This separation of concerns makes it seamless to experiment with new models, integrate custom-hosted solutions, and adopt the best AI technology as it evolves, all without impacting the core business logic of the platform.

*   **Secure & Enterprise-Ready:** Security is not an afterthought; it is a foundational pillar. From a dedicated authentication service handling identity to strict data encryption and role-based access control, every component is designed to meet the rigorous security and compliance standards of a modern enterprise.

### **Core Technology Stack:**

Our technology stack is built on a polyglot philosophy, leveraging best-in-class, modern technologies for each specific domain. This ensures high performance, scalability, and maintainability across the entire platform.

#### ***Client-Facing Application (`frontend`)***
*   **Framework:** **ReactJS**
    *   **Why:** For building a dynamic, component-based, and highly interactive user interface, including the complex visual workflow builder.
*   **Styling:** **TailwindCSS**
    *   **Why:** A utility-first CSS framework that enables rapid development of a consistent and modern design system.

#### ***Backend Services (Microservices)***
We employ a dual-language approach to our backend, using the ideal tool for each service's primary function.

*   **General Business Logic & Core Services (`company`, `auth`, `agents`, `notifications`)**
    *   **Framework:** **NestJS (Node.js / TypeScript)**
    *   **Why:** Chosen for its structured, scalable architecture and exceptional performance in handling I/O-intensive operations like API orchestration, database interactions, and real-time communication. TypeScript ensures type safety and maintainability as the codebase grows.

*   **AI Reasoning Engine (`ai`)**
    *   **Framework:** **Python & FastAPI**
    *   **Why:** To leverage Python's unparalleled ecosystem for Artificial Intelligence. FastAPI provides a modern, high-performance framework for building the AI service's API, offering asynchronous capabilities and automatic data validation.
    *   **Key Libraries:**
        *   **`LangChain` / `LlamaIndex`:** To build sophisticated, context-aware applications by chaining LLM calls and connecting them to the agent's knowledge base.
        *   **`OpenAI`, `Google-GenerativeAI`, `Anthropic` SDKs:** For seamless and reliable interaction with leading external LLM providers.

#### ***Data Persistence & Caching***
*   **Primary Database:** **MySQL**
    *   **Why:** A robust and reliable relational database for structured data, ensuring data integrity through ACID compliance for all core business entities.
*   **In-Memory Store:** **Redis**
    *   **Why:** A high-performance, versatile in-memory data store used for two critical functions:
        1.  **Caching:** Reducing latency and cost by caching frequent database queries and expensive LLM API responses.
        2.  **Message Bus:** Facilitating asynchronous communication and job queuing between microservices.

#### ***Infrastructure & Deployment***
*   **Containerization:** **Docker & Docker Compose**
    *   **Why:** For containerizing all services, which encapsulates dependencies and ensures a consistent, reproducible environment across development, testing, and production. Docker Compose orchestrates the entire stack for simplified local development.

## 2. High-Level Architecture

The system is composed of several containerized services that communicate over a dedicated network, orchestrated by Docker Compose for local development. An API Gateway serves as the single, secure entry point for all client requests.

### System Interaction Diagram
```
        +-----------------------------------------------------------------+
        |                        End Users                                |
        +-----------------------------------------------------------------+
                                       |
                                       | (HTTPS)
                                       v
+----------------------------------------------------------------------------------+
| docker-compose Network                                                           |
|                                                                                  |
|      +------------------------+      +---------------------+                     |
|      |                        |----->|                     |                     |
|      |    /frontend (React)   |      |   /api (Nginx GW)   |                     |
|      | (Browser)              |<-----| (Reverse Proxy)     |                     |
|      +------------------------+      +-------+-------------+                     |
|                                              |                                   |
|         +------------+---------------+---------------+------------+              |
|         |            |               |               |            |              |
|         v            v               v               v            v              |
| +-------+-----+ +----+----------+ +---+-------+ +-----+-----+ +----+----------+  |
| |             | |               | |           | |           | |               |  |
| | /auth       | |/company-s...  | | /agents   | |/notificat.| | /mysql        |  |
| | (NestJS)    | |  (NestJS) ------> /ai       | | ..ions    | | (Database)    |  |
| |             | |               | | (NestJS)  | | (NestJS)  | +------+--------+  |
| +-------------+ +----+----------+ +-----------+ +-----------+        ^           |
|                      |               ^                               |           |
|                      +---------------+-------------------------------+           |
|                                      |                                           |
|                                      v                                           |
|                               +------+------+                                    |
|                               | /redis      |                                    |
|                               | (Cache/Bus) |                                    |
|                               +-------------+                                    |
|                                                                                  |
+----------------------------------------------------------------------------------+
                                         | (API Calls)
                                         v
                            +------------------------+
                            | External LLM Providers |
                            | (OpenAI, Gemini, etc.) |
                            +------------------------+
```

## 3. Service Breakdown

### `/ai` (AI/LLM Service)
*   **Description:** A centralized hub for all AI reasoning tasks. It abstracts the complexity of dealing with various LLM providers behind a simple, internal API.
*   **Responsibilities:**
    *   **Model Abstraction:** Provides a unified interface for other services to request tasks like "summarize text," "extract data from document," or "classify intent," regardless of the underlying model (Gemini, OpenAI, etc.). This makes the platform truly **model-agnostic**.
    *   **Prompt Engineering & Management:** Contains the logic for constructing optimal, context-rich prompts to send to LLMs.
    *   **Credential Management:** Securely stores and manages API keys for all third-party AI services.
    *   **Caching:** Implements caching strategies for LLM responses to reduce latency and cost.
    *   **Future Expansion:** Can be expanded to host smaller, specialized, open-source models for specific tasks.
*   **Technology Stack:**
    *   **Language:** **Python 3.10+** (The industry standard for AI/ML).
    *   **Framework:** **FastAPI** (For building high-performance, modern APIs).
    *   **Core Libraries:**
        *   **`LangChain` or `LlamaIndex`:** To build sophisticated, context-aware applications by chaining LLM calls and connecting them to the agent's knowledge base.
        *   **`OpenAI`, `Google-GenerativeAI`, `Anthropic`:** Official Python clients for interacting with external LLM providers.
        *   **`Pydantic`:** For robust data validation (included with FastAPI).
        *   **`HTTPX`:** For making asynchronous API calls to external services.

### `/frontend`
*   **Description:** The client-facing Single Page Application (SPA).
*   **Responsibilities:**
    *   Provides the UI for all functional requirements, including the intuitive "Visual Workflow Builder."
    *   Handles user interactions for agent creation, dashboard monitoring, and user management.
    *   Communicates exclusively with the `/api` gateway.
*   **Technology:** ReactJS, TailwindCSS.

### `/api` (API Gateway)
*   **Description:** The single public entry point for the entire backend system.
*   **Responsibilities:**
    *   Routes incoming requests to the appropriate internal service (`/auth`, `/agents`, etc.).
    *   Handles SSL termination, ensuring all traffic is encrypted.
    *   Provides a layer for security enforcement, rate limiting, and request logging.
*   **Technology:** Nginx.

### `/auth` (Authentication Service)
*   **Description:** A standalone service dedicated to user identity and access control.
*   **Responsibilities:**
    *   Handles user sign-up, login, and password management.
    *   Issues, validates, and refreshes JSON Web Tokens (JWTs) for secure API access.
    *   Manages user authentication state.
*   **Technology:** NestJS.

### `/agents` (Agents Service)
*   **Description:** A specialized microservice for all agent-related data and logic.
*   **Responsibilities:**
    *   Manages the lifecycle (CRUD) of AI agents.
    *   Stores agent configurations, goals, and performance metrics.
    *   Handles the "Knowledge Base Integration" by managing connections to data sources like S3 and Google Drive.
*   **Technology:** NestJS.

### `/company` (Core Business Logic Service)
*   **Description:** A modular service that handles core business operations.
*   **Responsibilities:**
    *   **User & Company Management:** Manages company profiles, users, and roles.
    *   **Core Task Execution Engine:** Executes workflows. **When a step requires AI reasoning, it now makes an internal API call to the `/ai` service.**
    *   **External Integrations:** Manages integrations with non-AI services (e.g., Google Calendar, Slack API).
    *   **Analytics & Reporting:** Generates reports on agent usage.
*   **Technology:** NestJS.

### `/notifications` (Notifications Service)
*   **Description:** A dedicated microservice for dispatching all user-facing notifications.
*   **Responsibilities:**
    *   Provides a simple API for other services to request notification delivery.
    *   Integrates with external providers for sending emails (e.g., SendGrid) and Slack messages.
    *   Manages notification templates and credentials.
*   **Technology:** NestJS.

### `/mysql` & `/redis`
*   **Description:** The persistence and caching layers.
*   **Responsibilities:**
    *   **MySQL:** Provides the primary, reliable relational data store for all services.
    *   **Redis:** Acts as a high-performance cache for frequently accessed data and a message bus for asynchronous communication between services.

---

## 4. Project Directory Structure

```
.
├── ai/
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── api/
│   ├── nginx.conf
│   └── Dockerfile
├── auth/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── agents/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── notifications/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── company/
│   ├── src/
│   │   ├── users/
│   │   ├── workflows/
│   │   └── integrations/
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── mysql/
│   └── init/
│       └── 01-init.sql
├── .env
└── docker-compose.yml
```

---

## 5. Docker Compose Configuration

This file orchestrates the entire application stack for a consistent local development environment.

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    ports: ["3306:3306"]
    networks: [app-network]

  redis:
    image: redis:6.2-alpine
    container_name: redis
    restart: unless-stopped
    ports: ["6379:6379"]
    networks: [app-network]

  ai:
    build:
      context: ./ai
    container_name: ai-service
    restart: unless-stopped
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on: [redis]
    networks: [app-network]

  api:
    build: { context: ./api }
    container_name: api-gateway
    restart: unless-stopped
    ports: ["80:80"]
    depends_on: [auth, company, agents, notifications]
    networks: [app-network]

  frontend:
    build: { context: ./frontend }
    container_name: frontend-app
    restart: unless-stopped
    ports: ["3000:3000"]
    networks: [app-network]

  auth:
    build: { context: ./auth }
    container_name: auth-service
    restart: unless-stopped
    environment:
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@db:3306/${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
    depends_on: [db]
    networks: [app-network]

  company:
    build: { context: ./company }
    container_name: company
    restart: unless-stopped
    environment:
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@db:3306/${DB_NAME}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on: [db, redis, ai]
    networks: [app-network]

  agents:
    build: { context: ./agents }
    container_name: agents-service
    restart: unless-stopped
    environment:
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@db:3306/${DB_NAME}
    depends_on: [db]
    networks: [app-network]

  notifications:
    build: { context: ./notifications }
    container_name: notifications-service
    restart: unless-stopped
    environment:
      - SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    networks: [app-network]

volumes:
  mysql-data:

networks:
  app-network:
    driver: bridge
```