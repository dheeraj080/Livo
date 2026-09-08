export interface NoteChunkDocument {
  chunk_id: string;
  note_id: string;
  user_id: string;
  notebook_id: string | null;
  title: string;
  text: string;
  chunk_position: number;
  metadata: {
    wordCount: number;
    charCount: number;
  };
  embedding: number[];
  updated_at: string;
}

/**
 * Splits long note text into meaningful overlapping chunks for semantic retrieval.
 */
export function chunkText(text: string, maxChunkChars = 1000, overlapChars = 150): string[] {
  if (!text || !text.trim()) {
    return [''];
  }

  const cleaned = text.trim();
  if (cleaned.length <= maxChunkChars) {
    return [cleaned];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = Math.min(start + maxChunkChars, cleaned.length);

    // Try to break at paragraph boundary, newline, or space to avoid splitting words awkwardly
    if (end < cleaned.length) {
      const lastNewline = cleaned.lastIndexOf('\n', end);
      if (lastNewline > start + maxChunkChars / 2) {
        end = lastNewline + 1;
      } else {
        const lastSpace = cleaned.lastIndexOf(' ', end);
        if (lastSpace > start + maxChunkChars / 2) {
          end = lastSpace + 1;
        }
      }
    }

    const chunkStr = cleaned.slice(start, end).trim();
    if (chunkStr.length > 0) {
      chunks.push(chunkStr);
    }

    start = end - overlapChars;
    if (start < 0) start = 0;
    if (end >= cleaned.length) break;
  }

  return chunks.length > 0 ? chunks : [cleaned];
}
