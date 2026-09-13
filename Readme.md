# livo

> **Self-hosted AI knowledge platform for your notes, documents, and ideas.**

livo is an open, self-hostable knowledge-management platform designed to give you control over your data, infrastructure, and AI.

It combines a modern note editor with full-text search, document processing, AI-powered tools, attachments, and a modular backend architecture.

---

## ✨ Features

* 📝 **Rich note editor** powered by Tiptap
* 📚 **Notebooks and notes** for organizing knowledge
* 🔎 **Full-text search** with Elasticsearch
* 🤖 **AI-powered knowledge tools**
* 📎 **File and document attachments**
* 📄 **Document text extraction**
* ⚡ **Asynchronous background processing**
* 🏷️ **Tags and organization**
* 🔐 **Self-hosted and privacy-focused**
* 🐳 **Docker-ready**
* 🗄️ **PostgreSQL** as the source of truth
* 🔴 **Redis + BullMQ** for background jobs
* 📦 **S3-compatible object storage** for files
* 🧩 **Modular monolith architecture**
* 🛠️ **TypeScript throughout the application**

---

## 🖼️ Overview

livo is designed around a simple idea:

> **Your knowledge should belong to you.**

Instead of sending your notes and documents to a hosted SaaS platform, livo can run on infrastructure you control.

```text
                         ┌─────────────────────┐
                         │       Browser       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       livo        │
                         │      Next.js        │
                         │                     │
                         │  UI + API + Modules │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │ PostgreSQL   │    │    Redis     │    │ Elasticsearch│
        │              │    │              │    │              │
        │ Source of    │    │ Jobs/Queues  │    │ Search       │
        │ Truth        │    │ BullMQ       │    │ Projection   │
        └──────────────┘    └───────┬──────┘    └──────────────┘
                                    │
                                    ▼
                             ┌──────────────┐
                             │    MinIO     │
                             │ / S3 Storage │
                             └──────────────┘
```

---

# 🏗️ Architecture

livo uses a **modular monolith** rather than microservices.

The goal is to keep development and deployment simple while maintaining strong boundaries between domains.

```text
livo
│
├── UI
│   ├── Landing Page
│   ├── Workspace
│   ├── Sidebar
│   ├── Editor
│   └── AI UI
│
├── API
│   └── /api/*
│
├── Modules
│   ├── auth
│   ├── notes
│   ├── notebooks
│   ├── attachments
│   ├── search
│   ├── tags
│   └── ai
│
└── Services
    ├── database
    ├── search
    ├── storage
    ├── jobs
    ├── documents
    └── AI
```

### Why a modular monolith?

livo keeps related functionality in the same application while maintaining clear module boundaries.

This provides:

* simpler local development
* simpler deployment
* fewer network calls
* easier debugging
* easier transactions
* lower infrastructure overhead
* the ability to extract modules into services later if necessary

---

# 🧰 Technology Stack

| Area                 | Technology                    |
| -------------------- | ----------------------------- |
| Frontend             | React                         |
| Framework            | Next.js 15                    |
| Language             | TypeScript                    |
| Editor               | Tiptap                        |
| Styling              | Tailwind CSS                  |
| UI                   | shadcn/ui / custom components |
| Database             | PostgreSQL                    |
| ORM                  | Drizzle ORM                   |
| Search               | Elasticsearch                 |
| Queue                | BullMQ                        |
| Queue backend        | Redis                         |
| Object storage       | S3-compatible storage         |
| Local object storage | MinIO                         |
| AI                   | Google Gemini / Ollama        |
| Validation           | Zod                           |
| Runtime              | Node.js                       |
| Containerization     | Docker                        |

---

# 📁 Project Structure

```text
.
├── app/
│   ├── api/
│   ├── app/
│   │   ├── page.tsx
│   │   └── notes/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
│
├── components/
│   ├── ai/
│   ├── editor/
│   ├── landing/
│   ├── sidebar/
│   └── workspace/
│
├── src/
│   └── server/
│       ├── lib/
│       │   └── config.ts
│       │
│       ├── modules/
│       │   ├── ai/
│       │   ├── attachments/
│       │   ├── auth/
│       │   ├── notebooks/
│       │   ├── notes/
│       │   ├── search/
│       │   └── tags/
│       │
│       └── services/
│           ├── ai/
│           ├── db/
│           ├── documents/
│           ├── jobs/
│           ├── search/
│           └── storage/
│
├── drizzle/
│   └── migrations/
│
├── packages/
│   └── ui/
│
├── Dockerfile
├── .dockerignore
├── package.json
├── next.config.ts
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

For local development you will need:

* Node.js 22+
* npm
* PostgreSQL
* Redis
* Elasticsearch
* S3-compatible object storage

Docker is recommended because it simplifies running the infrastructure.

---

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd livo
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Configure the required services.

Example:

```env
NODE_ENV=development

DATABASE_URL=postgresql://livo:livo@localhost:5432/livo

REDIS_URL=redis://localhost:6379

ELASTICSEARCH_URL=http://localhost:9200

S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minio
S3_SECRET_ACCESS_KEY=minio-secret
S3_BUCKET=livo
```

AI configuration can be added depending on the provider being used.

For Gemini:

```env
GEMINI_API_KEY=your-api-key
```

For Ollama:

```env
OLLAMA_BASE_URL=http://localhost:11434
```

> Never commit `.env.local` or API keys to Git.

---

# 🗄️ Database

livo uses PostgreSQL as its primary source of truth.

Generate Drizzle migrations:

```bash
npm run db:generate
```

Push the schema to the development database:

```bash
npm run db:push
```

---

# ▶️ Development

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

### Main routes

| Route             | Purpose             |
| ----------------- | ------------------- |
| `/`               | livo landing page |
| `/app`            | livo workspace    |
| `/app/notes/[id]` | Individual note     |
| `/api/*`          | Backend API         |

---

# 🐳 Docker

livo can be packaged as a production Next.js container.

The application uses Next.js standalone output.

Make sure `next.config.ts` contains:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

## Build the image

```bash
docker build -t livo .
```

## Run the application

```bash
docker run --rm -p 3000:3000 livo
```

Then open:

```text
http://localhost:3000
```

> The application container does not include PostgreSQL, Redis, Elasticsearch, or MinIO. A Docker Compose setup is recommended for running the complete livo stack.

---

# 🔄 Data Flow

A note typically follows this flow:

```text
                 Create / Update Note
                         │
                         ▼
                   livo API
                         │
                         ▼
                    PostgreSQL
                  Source of Truth
                         │
                         ▼
                  Background Job
                     BullMQ
                         │
                         ▼
                Document Processing
                         │
                         ▼
                Search Indexing
                         │
                         ▼
                  Elasticsearch
```

The database remains authoritative.

Elasticsearch is treated as a **search projection**, rather than the primary database.

This allows the search index to be rebuilt if necessary.

---

# 📄 Document Processing

livo supports asynchronous document processing.

The general pipeline is:

```text
Upload
  │
  ▼
Object Storage
  │
  ▼
Background Job
  │
  ▼
Text Extraction
  │
  ├── Apache Tika
  │
  └── Node.js fallback
  │
  ▼
Content Processing
  │
  ▼
Chunking
  │
  ▼
Elasticsearch Index
```

Large or expensive processing operations should run asynchronously so they don't block normal API requests.

---

# 🔎 Search

Elasticsearch provides full-text search over livo content.

The architecture intentionally separates:

```text
PostgreSQL
    │
    │ authoritative data
    ▼
Search indexing pipeline
    │
    ▼
Elasticsearch
    │
    │ optimized search projection
    ▼
Search API
```

If the Elasticsearch index is lost, it should be possible to rebuild it from PostgreSQL.

---

# 🤖 AI

livo is designed to support multiple AI providers.

Potential providers include:

* Google Gemini
* Ollama
* other OpenAI-compatible/local providers

AI functionality can be used for tasks such as:

* summarization
* question answering
* note assistance
* document understanding
* content extraction
* knowledge discovery

AI should operate on the user's data while respecting the deployment's configured privacy model.

---

# 📦 Object Storage

Attachments and uploaded documents should not be stored directly inside PostgreSQL.

livo uses S3-compatible object storage.

For self-hosted installations, **MinIO** can be used.

```text
livo
   │
   ▼
S3-compatible API
   │
   ├── AWS S3
   ├── MinIO
   └── Other S3-compatible storage
```

---

# 🔐 Security

livo is designed with self-hosting and data ownership in mind.

Production deployments should:

* use HTTPS
* use strong database credentials
* use strong o
