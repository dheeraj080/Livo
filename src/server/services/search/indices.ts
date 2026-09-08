import { getElasticsearchClient } from "./client";
import { logger } from "@/src/server/lib/logger";

export const NOTES_INDEX = "livo_notes";
export const CHUNKS_INDEX = "livo_note_chunks";

export interface NoteSearchDocument {
  note_id: string;
  user_id: string;
  notebook_id: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const CHUNKS_INDEX_MAPPING = {
  properties: {
    chunk_id: { type: "keyword" },
    note_id: { type: "keyword" },
    user_id: { type: "keyword" },
    notebook_id: { type: "keyword" },
    title: {
      type: "text",
      fields: { keyword: { type: "keyword", ignore_above: 256 } },
    },
    text: { type: "text" },
    chunk_position: { type: "integer" },
    metadata: { type: "object" },
    embedding: {
      type: "dense_vector",
      dims: 768,
      index: true,
      similarity: "cosine",
    },
    updated_at: { type: "date" },
  },
} as const;

/**
 * Canonical index mapping definition for the notes projection index.
 */
export const NOTES_INDEX_MAPPING = {
  properties: {
    note_id: {
      type: "keyword",
    },
    user_id: {
      type: "keyword",
    },
    notebook_id: {
      type: "keyword",
    },
    title: {
      type: "text",
      fields: {
        keyword: {
          type: "keyword",
          ignore_above: 256,
        },
      },
    },
    content: {
      type: "text",
    },
    tags: {
      type: "keyword",
    },
    created_at: {
      type: "date",
    },
    updated_at: {
      type: "date",
    },
  },
} as const;

export const NOTES_INDEX_SETTINGS = {
  number_of_shards: 1,
  number_of_replicas: 0,
  analysis: {
    analyzer: {
      default: {
        type: "standard",
      },
    },
  },
} as const;

let indexInitialized = false;

/**
 * Ensures the notes index exists with the expected mapping and settings.
 * If the index does not exist, it creates it.
 * If the index exists, it runs putMapping to safely migrate new fields.
 */
export async function ensureNotesIndexExists(): Promise<boolean> {
  if (indexInitialized) return true;

  const client = getElasticsearchClient();
  if (!client) {
    return false;
  }

  const startTime = Date.now();

  try {
    const exists = await client.indices.exists({ index: NOTES_INDEX });

    if (!exists) {
      logger.info({
        service: "elasticsearch",
        event: "index_creation_started",
        meta: { index: NOTES_INDEX },
      });

      await client.indices.create({
        index: NOTES_INDEX,
        settings: NOTES_INDEX_SETTINGS,
        mappings: NOTES_INDEX_MAPPING,
      });

      logger.info({
        service: "elasticsearch",
        event: "index_created",
        durationMs: Date.now() - startTime,
        meta: { index: NOTES_INDEX },
      });
    } else {
      // Safe schema migration: update mapping properties for existing index
      await client.indices.putMapping({
        index: NOTES_INDEX,
        properties: NOTES_INDEX_MAPPING.properties,
      });

      logger.debug({
        service: "elasticsearch",
        event: "index_mapping_updated",
        durationMs: Date.now() - startTime,
        meta: { index: NOTES_INDEX },
      });
    }

    indexInitialized = true;
    return true;
  } catch (error: any) {
    logger.error({
      service: "elasticsearch",
      event: "index_initialization_failed",
      durationMs: Date.now() - startTime,
      error,
      meta: { index: NOTES_INDEX },
    });
    return false;
  }
}

let chunksIndexInitialized = false;

export async function ensureChunksIndexExists(): Promise<boolean> {
  if (chunksIndexInitialized) return true;

  const client = getElasticsearchClient();
  if (!client) {
    return false;
  }

  try {
    const exists = await client.indices.exists({ index: CHUNKS_INDEX });

    if (!exists) {
      await client.indices.create({
        index: CHUNKS_INDEX,
        settings: NOTES_INDEX_SETTINGS,
        mappings: CHUNKS_INDEX_MAPPING,
      });
    } else {
      await client.indices.putMapping({
        index: CHUNKS_INDEX,
        properties: CHUNKS_INDEX_MAPPING.properties,
      });
    }

    chunksIndexInitialized = true;
    return true;
  } catch (error: any) {
    logger.error({
      service: "elasticsearch",
      event: "chunks_index_initialization_failed",
      error,
    });
    return false;
  }
}

/**
 * Explicit migration function that can be triggered via administration route
 * or during server bootstrap to inspect and migrate the index.
 */
export async function migrateNotesIndex(): Promise<{
  success: boolean;
  status: "created" | "updated" | "failed";
  index: string;
  durationMs: number;
  error?: string;
}> {
  const client = getElasticsearchClient();
  const startTime = Date.now();

  if (!client) {
    return {
      success: false,
      status: "failed",
      index: NOTES_INDEX,
      durationMs: 0,
      error: "Elasticsearch client is not configured or available",
    };
  }

  try {
    const exists = await client.indices.exists({ index: NOTES_INDEX });
    let status: "created" | "updated" = "updated";

    if (!exists) {
      await client.indices.create({
        index: NOTES_INDEX,
        settings: NOTES_INDEX_SETTINGS,
        mappings: NOTES_INDEX_MAPPING,
      });
      status = "created";
    } else {
      await client.indices.putMapping({
        index: NOTES_INDEX,
        properties: NOTES_INDEX_MAPPING.properties,
      });
    }

    indexInitialized = true;
    const durationMs = Date.now() - startTime;

    logger.info({
      service: "elasticsearch",
      event: "index_migration_completed",
      durationMs,
      meta: { index: NOTES_INDEX, status },
    });

    return {
      success: true,
      status,
      index: NOTES_INDEX,
      durationMs,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    logger.error({
      service: "elasticsearch",
      event: "index_migration_failed",
      durationMs,
      error,
      meta: { index: NOTES_INDEX },
    });

    return {
      success: false,
      status: "failed",
      index: NOTES_INDEX,
      durationMs,
      error: error?.message || "Migration failed",
    };
  }
}
