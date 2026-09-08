import zlib from 'zlib';
import { logger } from '@/src/server/lib/logger';

export interface ExtractionResult {
  text: string;
  wordCount: number;
  charCount: number;
}

/**
 * Normalizes raw extracted text (newlines, whitespace, control chars).
 */
export function normalizeText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // remove control chars
    .replace(/[ \t]+/g, ' ') // collapse multiple spaces/tabs
    .replace(/\n{3,}/g, '\n\n') // max 2 consecutive newlines
    .trim();
}

/**
 * Attempts text extraction via Apache Tika HTTP service if configured in environment.
 */
async function extractViaTika(buffer: Buffer, mimeType: string): Promise<string | null> {
  const tikaUrl = process.env.TIKA_URL || process.env.TIKA_SERVER_URL;
  if (!tikaUrl) {
    return null;
  }

  try {
    const endpoint = tikaUrl.endsWith('/') ? `${tikaUrl}tika` : `${tikaUrl}/tika`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        Accept: 'text/plain',
      },
      body: new Uint8Array(buffer),
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    logger.warn({
      service: 'extraction',
      event: 'tika_server_request_failed_fallback_to_native',
      error,
    });
  }

  return null;
}

/**
 * Extracts text from PDF files using FlateDecode decompression and PDF text operators.
 */
function extractPdfText(buffer: Buffer): string {
  let content = '';
  const bufString = buffer.toString('binary');
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(bufString)) !== null) {
    const streamData = Buffer.from(match[1], 'binary');
    let decompressed = '';
    try {
      decompressed = zlib.inflateSync(streamData).toString('utf-8');
    } catch {
      try {
        decompressed = zlib.inflateRawSync(streamData).toString('utf-8');
      } catch {
        decompressed = streamData.toString('utf-8');
      }
    }

    // Extract text from (text) Tj operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(decompressed)) !== null) {
      content += ' ' + tjMatch[1];
    }

    // Extract text from [(t) 10 (ext)] TJ operators
    const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;
    while ((arrayMatch = arrayTjRegex.exec(decompressed)) !== null) {
      const innerRegex = /\(([^)]*)\)/g;
      let innerMatch: RegExpExecArray | null;
      while ((innerMatch = innerRegex.exec(arrayMatch[1])) !== null) {
        content += innerMatch[1];
      }
      content += ' ';
    }
  }

  // Fallback if structured text streams were empty
  if (!content.trim()) {
    const raw = buffer.toString('utf-8');
    const strings = raw.match(/[a-zA-Z0-9.,;:?!'\"()\-_\s]{4,}/g) || [];
    content = strings
      .filter((s) => !s.includes('endobj') && !s.includes('/Root') && !s.includes('/Filter'))
      .join(' ');
  }

  return content;
}

/**
 * Extracts text from DOCX files by reading word/document.xml inside the zip structure.
 */
function extractDocxText(buffer: Buffer): string {
  let offset = 0;
  while (offset < buffer.length - 30) {
    if (buffer.readUInt32LE(offset) === 0x04034b50) {
      const compression = buffer.readUInt16LE(offset + 8);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const fileNameLen = buffer.readUInt16LE(offset + 26);
      const extraLen = buffer.readUInt16LE(offset + 28);
      const fileName = buffer.toString('utf8', offset + 30, offset + 30 + fileNameLen);
      const dataOffset = offset + 30 + fileNameLen + extraLen;

      if (fileName === 'word/document.xml') {
        const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
        let xml = '';
        if (compression === 8) {
          try {
            xml = zlib.inflateRawSync(compressedData).toString('utf8');
          } catch {
            xml = compressedData.toString('utf8');
          }
        } else {
          xml = compressedData.toString('utf8');
        }

        const texts: string[] = [];
        const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        let xmlMatch: RegExpExecArray | null;
        while ((xmlMatch = regex.exec(xml)) !== null) {
          texts.push(xmlMatch[1]);
        }
        return texts.join(' ');
      }
      offset = dataOffset + compressedSize;
    } else {
      offset++;
    }
  }

  // Fallback: extract string tokens
  return buffer.toString('utf-8').replace(/<[^>]+>/g, ' ');
}

/**
 * Extracts text from document buffers based on MIME type or filename.
 */
export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<ExtractionResult> {
  const lowerName = filename.toLowerCase();
  let rawText = '';

  try {
    // 1. Try Apache Tika if configured
    const tikaText = await extractViaTika(buffer, mimeType);
    if (tikaText !== null && tikaText.trim().length > 0) {
      rawText = tikaText;
    } else if (
      mimeType === 'application/pdf' ||
      lowerName.endsWith('.pdf')
    ) {
      rawText = extractPdfText(buffer);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      lowerName.endsWith('.docx')
    ) {
      rawText = extractDocxText(buffer);
    } else if (
      mimeType === 'text/plain' ||
      mimeType === 'text/markdown' ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md') ||
      lowerName.endsWith('.markdown')
    ) {
      rawText = buffer.toString('utf-8');
    } else if (
      mimeType === 'text/html' ||
      lowerName.endsWith('.html') ||
      lowerName.endsWith('.htm')
    ) {
      rawText = buffer.toString('utf-8').replace(/<[^>]+>/g, ' ');
    } else {
      // Fallback: try decoding as utf8 text
      rawText = buffer.toString('utf-8');
    }

    const text = normalizeText(rawText);
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const charCount = text.length;

    logger.info({
      service: 'extraction',
      event: 'document_text_extracted',
      meta: { filename, mimeType, wordCount, charCount },
    });

    return { text, wordCount, charCount };
  } catch (error: any) {
    logger.error({
      service: 'extraction',
      event: 'document_extraction_failed',
      meta: { filename, mimeType },
      error,
    });
    throw new Error(`Failed to extract text from document (${filename}): ${error?.message || 'Unknown error'}`);
  }
}
