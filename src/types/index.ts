export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Notebook {
  id: string;
  userId?: string;
  name: string;
  parentId?: string | null;
  description?: string;
  color?: string;
  icon?: string;
  noteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId?: string;
  name: string;
  color?: string;
  noteCount: number;
  createdAt?: string;
}

export interface Attachment {
  id: string;
  noteId: string;
  userId: string;
  filename: string;
  size: number;
  sizeBytes?: number;
  mimeType: string;
  contentType?: string;
  storageKey: string;
  publicUrl?: string;
  url?: string;
  presignedUrl?: string;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  extractedText?: string;
  processingError?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  contentJson: Record<string, any>;
  contentText: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId?: string;
  notebookId?: string | null;
  notebookName?: string;
  title: string;
  contentJson?: Record<string, any>;
  contentText?: string;
  content: string; // Serialized Tiptap JSON or string representation
  plainText?: string;
  tags: Tag[];
  attachments?: Attachment[];
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceHealthStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'unconfigured' | 'error';
  latencyMs?: number;
  message?: string;
  configured: boolean;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    postgres: ServiceHealthStatus;
    elasticsearch: ServiceHealthStatus;
    redis: ServiceHealthStatus;
    storage: ServiceHealthStatus;
    gemini: ServiceHealthStatus;
  };
}

export interface SearchQueryOptions {
  query: string;
  notebookId?: string;
  tagId?: string;
  includeTrashed?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResultItem {
  id: string;
  title: string;
  snippet: string;
  score: number;
  notebookId?: string;
  tags: string[];
  updatedAt: string;
}

export interface AIActionRequest {
  action: 'summarize' | 'outline' | 'action_items' | 'improve_writing' | 'custom_prompt';
  content: string;
  noteTitle?: string;
  customPrompt?: string;
}

export interface AIActionResponse {
  result: string;
  model: string;
  tokensUsed?: number;
}
