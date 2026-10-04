# livo — AI-Powered Personal Knowledge Management

livo is a modern, modular-monolith personal knowledge management application inspired by Evernote and Notion. It combines rich-text document editing, nested notebook hierarchies, full-text and semantic vector search, file attachment processing, and AI-assisted workflows into a single coherent system.

---

## Architecture Overview

livo runs as a cohesive Next.js modular monolith with dedicated, containerized backing services:

```text
                             Browser
                                |
                                v
                        +---------------+
                        |    livo     |
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

- **livo (Next.js 15 Standalone)**: Serves the full-featured web UI and API routes. Background workers for note indexing and attachment processing run within the process via BullMQ.
- **PostgreSQL 16**: Authoritative persistent relational database for users, notebooks, notes, note versions, tags, and attachment metadata.
- **Redis 7**: High-performance broker for BullMQ background queues with Append-Only File (AOF) persistence.
- **Elasticsearch 8.17**: Search projection storing note content and 768-dimensional dense vector embeddings for hybrid keyword and semantic retrieval.
- **MinIO**: S3-compatible high-performance object storage for binary document attachments.

---

## Self-Hosting with Docker

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) (Engine 24.0 or newer)
- [Docker Compose](https://docs.docker.com/compose/) (v2.20 or newer)

No Node.js or database installation is required on the host system when using Docker.

---

### Quick Start Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd livo
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Inspect and edit `.env` if desired. The defaults are pre-configured to work immediately out of the box with the internal Docker network.

   _(Optional)_ To enable Gemini AI features (note summarization, automated title generation, tagging, and Q&A), add your Gemini API key:

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

5. **Access livo:**
   Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## Automated Startup Flow

When `docker compose up -d` is executed:

1. **Backing Services Launch**: PostgreSQL, Redis, Elasticsearch, and MinIO start with persistent storage volumes.
2. **MinIO Bucket Auto-Provisioning**: The `minio-create-bucket` helper initializes the `livo-attachments` bucket idempotently.
3. **Database & Index Initialization**: The `docker-entrypoint.sh` runs `scripts/init-infrastructure.mjs`, which automatically applies all PostgreSQL migrations (`CREATE TABLE IF NOT EXISTS`) and sets up Elasticsearch mappings for notes and chunk vector indices.
4. **livo Service Starts**: Once health checks pass, the standalone Next.js server accepts requests on port 3000.

---

## Service Ports & Security

To maintain a secure posture, internal backing services are isolated within a private Docker network (`livo_network`):

| Service           | Container Port | Host Port       | Purpose                              |
| ----------------- | -------------- | --------------- | ------------------------------------ |
| **livo**          | `3000`         | `3000` (Public) | Web Application & API                |
| **MinIO Console** | `9001`         | `9001` (Admin)  | MinIO Web Dashboard (Optional)       |
| **PostgreSQL**    | `5432`         | None            | Internal database traffic only       |
| **Redis**         | `6379`         | None            | Internal queue traffic only          |
| **Elasticsearch** | `9200`         | None            | Internal search traffic only         |
| **MinIO S3 API**  | `9000`         | None            | Internal object storage traffic only |

---

## Useful Docker Commands

### Managing Containers

- **Start the stack in background:**

  ```bash
  docker compose up -d
  ```

- **Stop the stack gracefully:**

  ```bash
  docker compose down
  ```

- **Restart all services:**

  ```bash
  docker compose restart
  ```

- **Rebuild after source code updates:**
  ```bash
  docker compose build
  docker compose up -d
  ```

### Inspecting Logs & Health

- **View combined logs:**

  ```bash
  docker compose logs -f
  ```

- **View livo application logs:**

  ```bash
  docker compose logs -f livo
  ```

- **Check container health:**

  ```bash
  docker compose ps
  ```

- **Query system health endpoint:**
  ```bash
  curl -s http://localhost:3000/api/health | jq .
  ```

---

## Data Persistence & Volumes

Application state is preserved across container restarts and updates using named Docker volumes:

- `livo_postgres_data`: All relational tables, user data, notebooks, note versions, and metadata.
- `livo_redis_data`: BullMQ queue state and background job scheduling.
- `livo_elasticsearch_data`: Inverted full-text indices and vector embeddings.
- `livo_minio_data`: Binary file attachments and documents.

> **CRITICAL WARNING ON DATA RETENTION:**
> Running `docker compose down` will stop and remove containers **WITHOUT** deleting your persistent volumes.
> However, running:
>
> ```bash
> docker compose down -v
> ```
>
> **DELETES ALL VOLUMES AND PERMANENTLY DESTROYS ALL APPLICATION DATA.**
> Never use the `-v` flag unless you explicitly intend to perform a full factory reset.

---

## Backup and Recovery

### PostgreSQL Backup

```bash
docker exec -t livo_postgres pg_dump -U livo livo > livo_backup_$(date +%Y%m%d).sql
```

### PostgreSQL Restore

```bash
cat livo_backup.sql | docker exec -i livo_postgres psql -U livo -d livo
```

### MinIO Attachments Backup

Backup the MinIO data volume or copy files directly using the MinIO client:

```bash
docker run --rm --network livo_network -v $(pwd)/backup:/backup minio/mc \
  mirror http://minio:9000/livo-attachments /backup
```

---

## Updating livo

To pull the latest code and update your self-hosted deployment:

```bash
git pull origin main
docker compose build --pull
docker compose up -d
```

Database migrations and index mapping checks will automatically execute during container startup without deleting any existing data.

---

## Troubleshooting & Diagnostics

### Container Startup Issues

- **Check status of all containers:**

  ```bash
  docker compose ps -a
  ```

- **Inspect live logs of a specific failing service:**
  ```bash
  docker compose logs -f postgres
  docker compose logs -f elasticsearch
  docker compose logs -f livo
  ```

### Elasticsearch Memory Considerations

Elasticsearch requires sufficient virtual memory on Linux hosts. If the Elasticsearch container exits with code 137 or reports `max virtual memory areas vm.max_map_count [65530] is too low`:

```bash
sudo sysctl -w vm.max_map_count=262144
```

To persist this setting across host reboots, add to `/etc/sysctl.conf`:

```text
vm.max_map_count=262144
```

### Database Connection Retries

livo's startup entrypoint incorporates a 15-attempt (30-second) exponential readiness check to accommodate PostgreSQL initialization on slower hosts or SSDs. If PostgreSQL takes longer to become ready, livo retries automatically on initial web request.

### Verifying Service Connectivity

Query the built-in system diagnostics endpoint:

```bash
curl -i http://localhost:3000/api/health
```

A status of `200 OK` with `"status": "healthy"` indicates all relational, queue, search, and storage backing services are connected and operational.

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
