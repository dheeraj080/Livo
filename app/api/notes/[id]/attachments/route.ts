import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/server/modules/auth';
import {
  listNoteAttachments,
  uploadNoteAttachment,
} from '@/src/server/modules/attachments';
import { attachmentsRepository } from '@/src/server/repositories/attachments.repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id: noteId } = await params;

    // Verify user owns this note
    const isOwner = await attachmentsRepository.checkNoteOwnership(user.id, noteId);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized: Note not found or does not belong to you' },
        { status: 404 }
      );
    }

    const attachments = await listNoteAttachments(user.id, noteId);
    return NextResponse.json({ attachments });
  } catch (error: any) {
    console.error('[livo API] Failed to list note attachments:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to list attachments' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id: noteId } = await params;

    // Verify user owns this note
    const isOwner = await attachmentsRepository.checkNoteOwnership(user.id, noteId);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized: Note not found or does not belong to you' },
        { status: 403 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    let filename = '';
    let mimeType = 'application/octet-stream';
    let buffer: Buffer;
    let size = 0;
    let isImageOnly = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'Missing file in form data payload' },
          { status: 400 }
        );
      }

      filename = file.name || 'attachment.bin';
      mimeType = file.type || 'application/octet-stream';
      size = file.size;
      isImageOnly = formData.get('isImageOnly') === 'true';

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const json = await req.json();
      if (!json.filename || !json.dataBase64) {
        return NextResponse.json(
          { error: 'Invalid JSON payload. Expected filename and dataBase64 strings.' },
          { status: 400 }
        );
      }

      filename = json.filename;
      mimeType = json.mimeType || 'application/octet-stream';
      isImageOnly = Boolean(json.isImageOnly);
      buffer = Buffer.from(json.dataBase64, 'base64');
      size = buffer.length;
    } else {
      return NextResponse.json(
        { error: 'Unsupported Content-Type. Please use multipart/form-data or application/json.' },
        { status: 415 }
      );
    }

    const attachment = await uploadNoteAttachment({
      userId: user.id,
      noteId,
      filename,
      mimeType,
      size,
      fileBuffer: buffer,
      isImageOnly,
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error: any) {
    console.error('[livo API] Attachment upload error:', error);
    const status =
      error.message?.includes('exceeds the maximum') ? 413 :
      error.message?.includes('Unauthorized') || error.message?.includes('Access denied') ? 403 :
      error.message?.includes('Invalid') || error.message?.includes('permitted') ? 400 : 500;

    return NextResponse.json(
      { error: error?.message || 'Attachment upload failed' },
      { status }
    );
  }
}
