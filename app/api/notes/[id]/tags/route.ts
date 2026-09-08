import { NextRequest, NextResponse } from "next/server";
import {
  attachTagToNote,
  detachTagFromNote,
  setTagsForNote,
  attachTagSchema,
} from "@/src/server/modules/tags";
import { getCurrentUser } from "@/src/server/modules/auth";
import { z } from "zod";

const setTagsSchema = z.object({
  tagIds: z.array(z.string()),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    const { id: noteId } = await params;
    const body = await req.json();
    const parsed = attachTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid tag attachment payload",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    await attachTagToNote(user.id, noteId, parsed.data.tagId);
    return NextResponse.json({
      success: true,
      message: "Tag attached to note",
    });
  } catch (error: any) {
    console.error("[livo API] Failed to attach tag to note:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to attach tag to note" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    const { id: noteId } = await params;
    const { searchParams } = new URL(req.url);
    const tagId = searchParams.get("tagId");

    const parsed = attachTagSchema.safeParse({ tagId });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Valid tagId query parameter required",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const removed = await detachTagFromNote(user.id, noteId, parsed.data.tagId);
    return NextResponse.json({ success: removed });
  } catch (error: any) {
    console.error("[livo API] Failed to detach tag from note:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to detach tag from note" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    const { id: noteId } = await params;
    const body = await req.json();

    const parsed = setTagsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid tag IDs payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const tags = await setTagsForNote(user.id, noteId, parsed.data.tagIds);
    return NextResponse.json({ success: true, tags });
  } catch (error: any) {
    console.error("[livo API] Failed to set tags for note:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to set tags for note" },
      { status: 500 },
    );
  }
}
