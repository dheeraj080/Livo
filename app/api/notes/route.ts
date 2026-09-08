import { NextRequest, NextResponse } from 'next/server';
import {
  listNotes,
  createNote,
  createNoteSchema,
  listNotesQuerySchema,
} from '@/src/server/modules/notes';
import { getCurrentUser } from '@/src/server/modules/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const { searchParams } = new URL(req.url);

    const queryParsed = listNotesQuerySchema.safeParse({
      notebookId: searchParams.get('notebookId') || undefined,
      tagId: searchParams.get('tagId') || undefined,
      isTrashed: searchParams.get('isTrashed') === 'true',
      isPinned: searchParams.has('isPinned') ? searchParams.get('isPinned') === 'true' : undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    if (!queryParsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryParsed.error.format() },
        { status: 400 }
      );
    }

    const notes = await listNotes(user.id, queryParsed.data);
    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error('[livo API] Failed to fetch notes:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to list notes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid note payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const newNote = await createNote(user.id, parsed.data);
    return NextResponse.json(newNote, { status: 201 });
  } catch (error: any) {
    console.error('[livo API] Failed to create note:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create note' },
      { status: 500 }
    );
  }
}
