# Nimbus — AI-Powered Personal Knowledge Management

Nimbus is a modern, modular-monolith personal knowledge management application inspired by Evernote and Notion. It combines rich-text document editing, nested notebook hierarchies, full-text and semantic vector search, file attachment processing, and AI-assisted workflows into a single coherent system.

---

## Architecture Overview

Nimbus runs as a cohesive Next.js modular monolith with dedicated, containerized backing services:

```text
                             Browser
                                |
                                v
                        +---------------+
                        |    Nimbus     |
                        |   Next.js     |
                        |   UI + API    |
                        +-------+-------+
                                |
              +-----------------+------------------+
              |                 |                  |
              v                 v                  v
        +-----------+     +-----------+     +-------------+
        | PostgreSQL|     |   Redis   |     |Elasticsearch|
        +-----------+     +-----+-----+     +-------------+
                                |
                                v
                           +----------+
                           | BullMQ   |
                           | Workers  |
                           +----------+

                        +---------------+
                        |     MinIO     |
                        | S3-compatible |
                        | object storage|
                        +---------------+
```

* **Nimbus (Next.js 15 Standalone)**: Serves the full-featured web UI and API routes. Background workers for note indexing and attachment processing run within the process via BullMQ.
* **PostgreSQL 16**: Authoritative persistent relational database for users, notebooks, notes, note versions, tags, and attachment metadata.
* **Redis 7**: High-performance broker for BullMQ background queues with Append-Only File (AOF) persistence.
* **Elasticsearch 8.17**: Search projection storing note content and 768-dimensional dense vector embeddings for hybrid keyword and semantic retrieval.
* **MinIO**: S3-compatible high-performance object storage for binary document attachments.

---

## Self-Hosting with Docker

### Prerequisites

* [Docker](https://docs.docker.com/engine/install/) (Engine 24.0 or newer)
* [Docker Compose](https://docs.docker.com/compose/) (v2.20 or newer)

No Node.js or database installation is required on the host system when using Docker.

---

### Quick Start Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nimbus
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Inspect and edit `.env` if desired. The defaults are pre-configured to work immediately out of the box with the internal Docker network.
   
   *(Optional)* To enable Gemini AI features (note summarization, automated title generation, tagging, and Q&A), add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

3. **Build and launch the stack:**
   ```bash
   docker compose up -d
   ```

4. **Verify container status:**
   ```bash
   docker compose ps
   ```

5. **Access Nimbus:**
   Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## Automated Startup Flow

When `docker compose up -d` is executed:
1. **Backing Services Launch**: PostgreSQL, Redis, Elasticsearch, and MinIO start with persistent storage volumes.
2. **MinIO Bucket Auto-Provisioning**: The `minio-create-bucket` helper initializes the `nimbus-attachments` bucket idempotently.
3. **Database & Index Initialization**: The `docker-entrypoint.sh` runs `scripts/init-infrastructure.mjs`, which automatically applies all PostgreSQL migrations (`CREATE TABLE IF NOT EXISTS`) and sets up Elasticsearch mappings for notes and chunk vector indices.
4. **Nimbus Service Starts**: Once health checks pass, the standalone Next.js server accepts requests on port 3000.

---

## Service Ports & Security

To maintain a secure posture, internal backing services are isolated within a private Docker network (`nimbus_network`):

| Service | Container Port | Host Port | Purpose |
|---|---|---|---|
| **Nimbus** | `3000` | `3000` (Public) | Web Application & API |
| **MinIO Console** | `9001` | `9001` (Admin) | MinIO Web Dashboard (Optional) |
| **PostgreSQL** | `5432` | None | Internal database traffic only |
| **Redis** | `6379` | None | Internal queue traffic only |
| **Elasticsearch**| `9200` | None | Internal search traffic only |
| **MinIO S3 API** | `9000` | None | Internal object storage traffic only |

---

## Useful Docker Commands

### Managing Containers

* **Start the stack in background:**
  ```bash
  docker compose up -d
  ```

* **Stop the stack gracefully:**
  ```bash
  docker compose down
  ```

* **Restart all services:**
  ```bash
  docker compose restart
  ```

* **Rebuild after source code updates:**
  ```bash
  docker compose build
  docker compose up -d
  ```

### Inspecting Logs & Health

* **View combined logs:**
  ```bash
  docker compose logs -f
  ```

* **View Nimbus application logs:**
  ```bash
  docker compose logs -f nimbus
  ```

* **Check container health:**
  ```bash
  docker compose ps
  ```

* **Query system health endpoint:**
  ```bash
  curl -s http://localhost:3000/api/health | jq .
  ```

---

## Data Persistence & Volumes

Application state is preserved across container restarts and updates using named Docker volumes:

* `nimbus_postgres_data`: All relational tables, user data, notebooks, note versions, and metadata.
* `nimbus_redis_data`: BullMQ queue state and background job scheduling.
* `nimbus_elasticsearch_data`: Inverted full-text indices and vector embeddings.
* `nimbus_minio_data`: Binary file attachments and documents.

> **CRITICAL WARNING ON DATA RETENTION:**
> Running `docker compose down` will stop and remove containers **WITHOUT** deleting your persistent volumes.
> However, running:
> ```bash
> docker compose down -v
> ```
> **DELETES ALL VOLUMES AND PERMANENTLY DESTROYS ALL APPLICATION DATA.**
> Never use the `-v` flag unless you explicitly intend to perform a full factory reset.

---

## Backup and Recovery

### PostgreSQL Backup
```bash
docker exec -t nimbus_postgres pg_dump -U nimbus nimbus > nimbus_backup_$(date +%Y%m%d).sql
```

### PostgreSQL Restore
```bash
cat nimbus_backup.sql | docker exec -i nimbus_postgres psql -U nimbus -d nimbus
```

### MinIO Attachments Backup
Backup the MinIO data volume or copy files directly using the MinIO client:
```bash
docker run --rm --network nimbus_network -v $(pwd)/backup:/backup minio/mc \
  mirror http://minio:9000/nimbus-attachments /backup
```

---

## Updating Nimbus

To pull the latest code and update your self-hosted deployment:

```bash
git pull origin main
docker compose build --pull
docker compose up -d
```

Database migrations and index mapping checks will automatically execute during container startup without deleting any existing data.

---

## Local Development (Without Docker)

You can continue developing locally without running the full Docker stack:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Run production build
npm run build

# Run database migrations manually
npm run db:migrate
```
