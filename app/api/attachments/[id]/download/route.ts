import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/server/modules/auth';
import {
  downloadAttachmentContent,
  getAttachmentForUser,
} from '@/src/server/modules/attachments';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const preferRedirect = searchParams.get('redirect') === 'true';

    // Verify user owns the note and attachment
    const meta = await getAttachmentForUser(user.id, id);
    if (!meta) {
      return NextResponse.json(
        { error: 'Attachment not found or unauthorized' },
        { status: 404 }
      );
    }

    // If client requested presigned redirect and a remote presigned URL is available
    if (preferRedirect && meta.presignedUrl && !meta.presignedUrl.startsWith('/api/')) {
      return NextResponse.redirect(meta.presignedUrl, { status: 302 });
    }

    // Fetch binary from S3/MinIO via StorageService
    const file = await downloadAttachmentContent(user.id, id);
    if (!file) {
      return NextResponse.json(
        { error: 'File bytes could not be retrieved from object storage' },
        { status: 404 }
      );
    }

    const disposition = searchParams.get('download') === 'true' ? 'attachment' : 'inline';

    return new NextResponse(new Uint8Array(file.body), {
      status: 200,
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream',
        'Content-Length': String(file.size),
        'Content-Disposition': `${disposition}; filename="${encodeURIComponent(file.filename)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[livo API] Attachment download stream error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to download attachment' },
      { status: 500 }
    );
  }
}
