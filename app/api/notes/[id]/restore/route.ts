import { NextRequest, NextResponse } from "next/server";
import { updateNote } from "@/src/server/modules/notes";
import { getCurrentUser } from "@/src/server/modules/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;

    const restored = await updateNote(user.id, id, { isTrashed: false });
    if (!restored) {
      return NextResponse.json(
        { error: "Note not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(restored);
  } catch (error: any) {
    console.error("[livo API] Failed to restore note:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to restore note" },
      { status: 500 },
    );
  }
}
