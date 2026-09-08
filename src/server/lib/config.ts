import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().optional().default('3000'),
  APP_URL: z.string().optional(),

  // Database
  DATABASE_URL: z.string().optional(),

  // Elasticsearch
  ELASTICSEARCH_NODE: z.string().optional(),
  ELASTICSEARCH_API_KEY: z.string().optional(),
  ELASTICSEARCH_USERNAME: z.string().optional(),
  ELASTICSEARCH_PASSWORD: z.string().optional(),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // S3 / MinIO Object Storage
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional().default('us-east-1'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional().default('livo-attachments'),
  S3_FORCE_PATH_STYLE: z.string().optional().default('true'),

  // Gemini AI
  GEMINI_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  postgres: {
    connectionString: process.env.DATABASE_URL,
    isConfigured: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0),
  },

  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE,
    apiKey: process.env.ELASTICSEARCH_API_KEY,
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
    isConfigured: Boolean(process.env.ELASTICSEARCH_NODE && process.env.ELASTICSEARCH_NODE.length > 0),
  },

  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    isConfigured: Boolean(
      process.env.REDIS_URL || 
      (process.env.REDIS_HOST && process.env.REDIS_HOST.length > 0)
    ),
  },

  storage: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY || process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_KEY || process.env.S3_SECRET_ACCESS_KEY,
    bucketName: process.env.S3_BUCKET || process.env.S3_BUCKET_NAME || 'livo-attachments',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    isConfigured: Boolean(
      (process.env.S3_ACCESS_KEY || process.env.S3_ACCESS_KEY_ID) && 
      (process.env.S3_SECRET_KEY || process.env.S3_SECRET_ACCESS_KEY) &&
      process.env.S3_ENDPOINT
    ),
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    isConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0),
  },
};
