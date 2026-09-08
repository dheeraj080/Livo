import { NextRequest, NextResponse } from 'next/server';
import {
  getNote,
  updateNote,
  deleteNote,
  updateNoteSchema,
} from '@/src/server/modules/notes';
import { getCurrentUser } from '@/src/server/modules/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;

    const note = await getNote(user.id, id);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error: any) {
    console.error('[livo API] Failed to fetch note:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = updateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await updateNote(user.id, id, parsed.data);
    if (!updated) {
      return NextResponse.json(
        { error: 'Note not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[livo API] Failed to update note:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update note' },
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

    const success = await deleteNote(user.id, id);
    if (!success) {
      return NextResponse.json(
        { error: 'Note not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Note moved to trash' });
  } catch (error: any) {
    console.error('[livo API] Failed to delete note:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete note' },
      { status: 500 }
    );
  }
}
