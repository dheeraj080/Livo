import { Client } from '@elastic/elasticsearch';
import { config } from '@/src/server/lib/config';
import { logger } from '@/src/server/lib/logger';
import type { ServiceHealthStatus } from '@/src/types';

let esClient: Client | null = null;

/**
 * Singleton Elasticsearch client accessor.
 * Uses official @elastic/elasticsearch Node.js client.
 */
export function getElasticsearchClient(): Client | null {
  if (!config.elasticsearch.isConfigured || !config.elasticsearch.node) {
    return null;
  }

  if (!esClient) {
    try {
      const clientOptions: any = {
        node: config.elasticsearch.node,
        requestTimeout: 10000,
        maxRetries: 3,
      };

      if (config.elasticsearch.apiKey) {
        clientOptions.auth = {
          apiKey: config.elasticsearch.apiKey,
        };
      } else if (config.elasticsearch.username && config.elasticsearch.password) {
        clientOptions.auth = {
          username: config.elasticsearch.username,
          password: config.elasticsearch.password,
        };
      }

      esClient = new Client(clientOptions);

      logger.info({
        service: 'elasticsearch',
        event: 'client_initialized',
        meta: {
          node: config.elasticsearch.node,
          hasApiKey: Boolean(config.elasticsearch.apiKey),
          hasBasicAuth: Boolean(config.elasticsearch.username),
        },
      });
    } catch (err) {
      logger.error({
        service: 'elasticsearch',
        event: 'client_initialization_failed',
        error: err,
      });
      return null;
    }
  }

  return esClient;
}

/**
 * Health check for Elasticsearch cluster.
 */
export async function checkElasticsearchHealth(): Promise<ServiceHealthStatus> {
  if (!config.elasticsearch.isConfigured || !config.elasticsearch.node) {
    return {
      name: 'Elasticsearch',
      configured: false,
      status: 'unconfigured',
      message: 'ELASTICSEARCH_NODE environment variable is not set',
    };
  }

  const startTime = Date.now();
  const client = getElasticsearchClient();

  if (!client) {
    return {
      name: 'Elasticsearch',
      configured: true,
      status: 'disconnected',
      message: 'Failed to construct Elasticsearch client',
    };
  }

  try {
    const isAlive = await client.ping();
    const latencyMs = Date.now() - startTime;

    if (isAlive) {
      const clusterInfo = await client.info();
      return {
        name: 'Elasticsearch',
        configured: true,
        status: 'connected',
        latencyMs,
        message: `Connected to cluster '${clusterInfo.cluster_name}' v${clusterInfo.version?.number || 'unknown'} (${latencyMs}ms)`,
      };
    }

    return {
      name: 'Elasticsearch',
      configured: true,
      status: 'disconnected',
      message: 'Elasticsearch node did not respond to ping',
    };
  } catch (error: any) {
    return {
      name: 'Elasticsearch',
      configured: true,
      status: 'error',
      message: error?.message || 'Elasticsearch connection error',
    };
  }
}
