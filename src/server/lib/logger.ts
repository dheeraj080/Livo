export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLogPayload {
  service: string;
  event: string;
  level?: LogLevel;
  userId?: string;
  noteId?: string;
  attachmentId?: string;
  filename?: string;
  mimeType?: string;
  jobId?: string;
  attempt?: number;
  maxAttempts?: number;
  durationMs?: number;
  error?: Error | string | unknown;
  meta?: Record<string, any>;
  message?: string;
}

class StructuredLogger {
  private formatError(err: unknown): Record<string, any> | undefined {
    if (!err) return undefined;
    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    }
    if (typeof err === 'string') {
      return { message: err };
    }
    return { details: String(err) };
  }

  private log(level: LogLevel, payload: StructuredLogPayload): void {
    const timestamp = new Date().toISOString();
    const formattedError = payload.error ? this.formatError(payload.error) : undefined;

    const logEntry = {
      timestamp,
      level,
      service: payload.service,
      event: payload.event,
      ...(payload.message ? { message: payload.message } : {}),
      ...(payload.userId ? { userId: payload.userId } : {}),
      ...(payload.noteId ? { noteId: payload.noteId } : {}),
      ...(payload.attachmentId ? { attachmentId: payload.attachmentId } : {}),
      ...(payload.filename ? { filename: payload.filename } : {}),
      ...(payload.mimeType ? { mimeType: payload.mimeType } : {}),
      ...(payload.jobId ? { jobId: payload.jobId } : {}),
      ...(payload.attempt !== undefined ? { attempt: payload.attempt } : {}),
      ...(payload.maxAttempts !== undefined ? { maxAttempts: payload.maxAttempts } : {}),
      ...(payload.durationMs !== undefined ? { durationMs: payload.durationMs } : {}),
      ...(payload.meta ? { meta: payload.meta } : {}),
      ...(formattedError ? { error: formattedError } : {}),
    };

    const jsonString = JSON.stringify(logEntry);

    switch (level) {
      case 'error':
        console.error(jsonString);
        break;
      case 'warn':
        console.warn(jsonString);
        break;
      case 'info':
        console.info(jsonString);
        break;
      case 'debug':
        if (process.env.NODE_ENV !== 'production') {
          console.debug(jsonString);
        }
        break;
    }
  }

  debug(payload: Omit<StructuredLogPayload, 'level'>): void {
    this.log('debug', payload);
  }

  info(payload: Omit<StructuredLogPayload, 'level'>): void {
    this.log('info', payload);
  }

  warn(payload: Omit<StructuredLogPayload, 'level'>): void {
    this.log('warn', payload);
  }

  error(payload: Omit<StructuredLogPayload, 'level'>): void {
    this.log('error', payload);
  }
}

export const logger = new StructuredLogger();
