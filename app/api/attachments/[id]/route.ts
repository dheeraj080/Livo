import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/server/modules/auth';
import {
  getAttachmentForUser,
  removeAttachment,
} from '@/src/server/modules/attachments';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;

    // Secure authorization: user may only access attachments belonging to their own notes
    const attachment = await getAttachmentForUser(user.id, id);
    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found or you do not have permission to view it.' },
        { status: 404 }
      );
    }

    return NextResponse.json(attachment);
  } catch (error: any) {
    console.error('[livo API] Failed to fetch attachment:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch attachment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;

    // Secure authorization: user may only delete attachments belonging to their own notes
    const deleted = await removeAttachment(user.id, id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Attachment not found or you do not have permission to delete it.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Attachment deleted successfully from S3 storage and database.',
    });
  } catch (error: any) {
    console.error('[livo API] Failed to delete attachment:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}
