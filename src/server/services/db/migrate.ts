import { getDatabasePool } from './index';

export const INITIAL_MIGRATION_SQL = `
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

let migrationRunPromise: Promise<void> | null = null;

export async function runDatabaseMigrations(): Promise<{ success: boolean; error?: string }> {
  const pool = getDatabasePool();
  if (!pool) {
    return { success: false, error: 'Database connection pool not available' };
  }

  if (migrationRunPromise) {
    await migrationRunPromise;
    return { success: true };
  }

  migrationRunPromise = (async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(INITIAL_MIGRATION_SQL);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  })();

  try {
    await migrationRunPromise;
    return { success: true };
  } catch (err: any) {
    migrationRunPromise = null;
    console.error('[livo Migrations] Execution failed:', err);
    return { success: false, error: err?.message || 'Migration execution failed' };
  }
}
