import pg from 'pg';
import { Client } from '@elastic/elasticsearch';

const { Pool } = pg;

const INITIAL_MIGRATION_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "avatar_url" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE ("email")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");

CREATE TABLE IF NOT EXISTS "notebooks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "parent_id" UUID REFERENCES "notebooks"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "notebooks_user_id_idx" ON "notebooks" ("user_id");
CREATE INDEX IF NOT EXISTS "notebooks_parent_id_idx" ON "notebooks" ("parent_id");

CREATE TABLE IF NOT EXISTS "notes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "notebook_id" UUID REFERENCES "notebooks"("id") ON DELETE SET NULL,
  "title" TEXT DEFAULT 'Untitled' NOT NULL,
  "content_json" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "content_text" TEXT DEFAULT '' NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS "notes_user_id_idx" ON "notes" ("user_id");
CREATE INDEX IF NOT EXISTS "notes_notebook_id_idx" ON "notes" ("notebook_id");
CREATE INDEX IF NOT EXISTS "notes_deleted_at_idx" ON "notes" ("deleted_at");
CREATE INDEX IF NOT EXISTS "notes_user_deleted_updated_idx" ON "notes" ("user_id", "deleted_at", "updated_at");

CREATE TABLE IF NOT EXISTS "tags" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "tags_user_id_idx" ON "tags" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "tags_user_name_unique_idx" ON "tags" ("user_id", "name");

CREATE TABLE IF NOT EXISTS "note_tags" (
  "note_id" UUID NOT NULL REFERENCES "notes"("id") ON DELETE CASCADE,
  "tag_id" UUID NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  PRIMARY KEY ("note_id", "tag_id")
);

CREATE INDEX IF NOT EXISTS "note_tags_tag_id_idx" ON "note_tags" ("tag_id");
CREATE INDEX IF NOT EXISTS "note_tags_note_id_idx" ON "note_tags" ("note_id");

CREATE TABLE IF NOT EXISTS "attachments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "note_id" UUID NOT NULL REFERENCES "notes"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "storage_key" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "attachments_note_id_idx" ON "attachments" ("note_id");
CREATE INDEX IF NOT EXISTS "attachments_user_id_idx" ON "attachments" ("user_id");

CREATE TABLE IF NOT EXISTS "note_versions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "note_id" UUID NOT NULL REFERENCES "notes"("id") ON DELETE CASCADE,
  "content_json" JSONB NOT NULL,
  "content_text" TEXT DEFAULT '' NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "note_versions_note_id_idx" ON "note_versions" ("note_id");
CREATE INDEX IF NOT EXISTS "note_versions_note_created_idx" ON "note_versions" ("note_id", "created_at");
`;

const NOTES_INDEX = 'Livo_notes';
const CHUNKS_INDEX = 'Livo_note_chunks';

const NOTES_INDEX_SETTINGS = {
  number_of_shards: 1,
  number_of_replicas: 0,
  analysis: {
    analyzer: {
      default: {
        type: 'standard',
      },
    },
  },
};

const NOTES_INDEX_MAPPING = {
  properties: {
    note_id: { type: 'keyword' },
    user_id: { type: 'keyword' },
    notebook_id: { type: 'keyword' },
    title: {
      type: 'text',
      fields: { keyword: { type: 'keyword', ignore_above: 256 } },
    },
    content: { type: 'text' },
    tags: { type: 'keyword' },
    created_at: { type: 'date' },
    updated_at: { type: 'date' },
  },
};

const CHUNKS_INDEX_MAPPING = {
  properties: {
    chunk_id: { type: 'keyword' },
    note_id: { type: 'keyword' },
    user_id: { type: 'keyword' },
    notebook_id: { type: 'keyword' },
    title: {
      type: 'text',
      fields: { keyword: { type: 'keyword', ignore_above: 256 } },
    },
    text: { type: 'text' },
    chunk_position: { type: 'integer' },
    metadata: { type: 'object' },
    embedding: {
      type: 'dense_vector',
      dims: 768,
      index: true,
      similarity: 'cosine',
    },
    updated_at: { type: 'date' },
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initializePostgres() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('[Livo Init] DATABASE_URL not set, skipping database migration.');
    return;
  }

  console.log('[Livo Init] Connecting to PostgreSQL to verify schema...');
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
  });

  let connected = false;
  const maxRetries = 15;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      try {
        console.log(`[Livo Init] Connected to PostgreSQL (attempt ${attempt}). Applying migrations...`);
        await client.query('BEGIN');
        await client.query(INITIAL_MIGRATION_SQL);
        await client.query('COMMIT');
        console.log('[Livo Init] PostgreSQL database migrations applied successfully.');
        connected = true;
        break;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn(`[Livo Init] Database connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt < maxRetries) {
        await sleep(2000);
      }
    }
  }

  await pool.end().catch(() => {});

  if (!connected) {
    throw new Error('[Livo Init] Could not connect to PostgreSQL after multiple attempts.');
  }
}

async function initializeElasticsearch() {
  const esNode = process.env.ELASTICSEARCH_NODE;
  if (!esNode) {
    console.log('[Livo Init] ELASTICSEARCH_NODE not set, skipping Elasticsearch setup.');
    return;
  }

  console.log(`[Livo Init] Connecting to Elasticsearch at ${esNode}...`);
  const clientOptions = {
    node: esNode,
    requestTimeout: 10000,
    maxRetries: 3,
  };

  if (process.env.ELASTICSEARCH_API_KEY) {
    clientOptions.auth = { apiKey: process.env.ELASTICSEARCH_API_KEY };
  } else if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
    clientOptions.auth = {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    };
  }

  const client = new Client(clientOptions);

  let connected = false;
  const maxRetries = 15;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const ping = await client.ping();
      if (ping) {
        console.log(`[Livo Init] Connected to Elasticsearch (attempt ${attempt}). Verifying indices...`);
        connected = true;
        break;
      }
    } catch (err) {
      console.warn(`[Livo Init] Elasticsearch ping attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt < maxRetries) {
        await sleep(2000);
      }
    }
  }

  if (!connected) {
    console.warn('[Livo Init] Warning: Elasticsearch did not respond to ping. Application will continue with on-demand retry.');
    return;
  }

  // 1. Ensure notes index exists
  try {
    const notesExists = await client.indices.exists({ index: NOTES_INDEX });
    if (!notesExists) {
      await client.indices.create({
        index: NOTES_INDEX,
        settings: NOTES_INDEX_SETTINGS,
        mappings: NOTES_INDEX_MAPPING,
      });
      console.log(`[Livo Init] Created Elasticsearch index '${NOTES_INDEX}'.`);
    } else {
      await client.indices.putMapping({
        index: NOTES_INDEX,
        properties: NOTES_INDEX_MAPPING.properties,
      });
      console.log(`[Livo Init] Verified Elasticsearch index '${NOTES_INDEX}'.`);
    }
  } catch (err) {
    console.warn(`[Livo Init] Notice on '${NOTES_INDEX}' index check:`, err.message);
  }

  // 2. Ensure note chunks index exists
  try {
    const chunksExists = await client.indices.exists({ index: CHUNKS_INDEX });
    if (!chunksExists) {
      await client.indices.create({
        index: CHUNKS_INDEX,
        settings: NOTES_INDEX_SETTINGS,
        mappings: CHUNKS_INDEX_MAPPING,
      });
      console.log(`[Livo Init] Created Elasticsearch index '${CHUNKS_INDEX}'.`);
    } else {
      await client.indices.putMapping({
        index: CHUNKS_INDEX,
        properties: CHUNKS_INDEX_MAPPING.properties,
      });
      console.log(`[Livo Init] Verified Elasticsearch index '${CHUNKS_INDEX}'.`);
    }
  } catch (err) {
    console.warn(`[Livo Init] Notice on '${CHUNKS_INDEX}' index check:`, err.message);
  }

  console.log('[Livo Init] Elasticsearch index verification complete.');
}

async function main() {
  console.log('====================================================');
  console.log(' Livo Self-Hosted Infrastructure Initializer');
  console.log('====================================================');

  try {
    await initializePostgres();
  } catch (err) {
    console.error('[Livo Init] Fatal PostgreSQL error:', err.message);
    process.exit(1);
  }

  try {
    await initializeElasticsearch();
  } catch (err) {
    console.warn('[Livo Init] Non-fatal Elasticsearch initialization warning:', err.message);
  }

  console.log('[Livo Init] Infrastructure readiness checks passed. Starting Livo...');
}

main().catch((err) => {
  console.error('[Livo Init] Unexpected initialization error:', err);
  process.exit(1);
});
