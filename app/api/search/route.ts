import { NextRequest, NextResponse } from 'next/server';
import { searchQuerySchema, searchNotes } from '@/src/server/modules/search';
import { getCurrentUser } from '@/src/server/modules/auth';

export async function GET(req: NextRequest) {
  try {
    // 1. Resolve Authenticated User (Security Requirement: all searches MUST be user-scoped)
    const user = await getCurrentUser(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: User authentication required for search' },
        { status: 401 }
      );
    }

    // 2. Parse Query Parameters
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const notebookId = searchParams.get('notebookId') || undefined;
    const tagId = searchParams.get('tagId') || undefined;
    const rawTagIds = searchParams.getAll('tagIds');
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;
    const page = searchParams.get('page') || undefined;
    const pageSize = searchParams.get('pageSize') || undefined;
    const limit = searchParams.get('limit') || undefined;
    const offset = searchParams.get('offset') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortOrder = searchParams.get('sortOrder') || undefined;
    const noteId = searchParams.get('noteId') || undefined;
    const searchMode = searchParams.get('searchMode') || undefined;

    // Normalizing tagIds
    let tagIds: string[] | undefined;
    if (rawTagIds.length > 0) {
      tagIds = rawTagIds.flatMap((t) => t.split(',')).map((t) => t.trim()).filter(Boolean);
    } else if (tagId) {
      tagIds = [tagId.trim()];
    }

    // Derive page and pageSize if limit/offset passed
    let computedPage = page ? parseInt(page, 10) : 1;
    let computedPageSize = pageSize ? parseInt(pageSize, 10) : 20;

    if (limit) {
      computedPageSize = parseInt(limit, 10);
    }
    if (offset && computedPageSize > 0) {
      computedPage = Math.floor(parseInt(offset, 10) / computedPageSize) + 1;
    }

    const parsed = searchQuerySchema.safeParse({
      q,
      notebookId,
      tagId,
      tagIds,
      fromDate,
      toDate,
      page: computedPage,
      pageSize: computedPageSize,
      sortBy,
      sortOrder,
      noteId,
      searchMode,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    // 3. Execute Search strictly scoped by user.id
    const searchResults = await searchNotes({
      userId: user.id,
      query: parsed.data.q,
      notebookId: parsed.data.notebookId,
      tagIds,
      fromDate: parsed.data.fromDate,
      toDate: parsed.data.toDate,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      sortBy: parsed.data.sortBy,
      sortOrder: parsed.data.sortOrder,
      noteId: parsed.data.noteId,
      searchMode: parsed.data.searchMode,
    });

    return NextResponse.json(searchResults);
  } catch (error: any) {
    console.error('[livo API] Search error:', error);
    return NextResponse.json(
      { error: error?.message || 'Search execution failed' },
      { status: 500 }
    );
  }
}
