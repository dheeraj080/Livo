import { NextRequest, NextResponse } from "next/server";
import {
  listNotebooks,
  createNotebook,
  createNotebookSchema,
} from "@/src/server/modules/notebooks";
import { getCurrentUser } from "@/src/server/modules/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const notebooks = await listNotebooks(user.id);
    return NextResponse.json({ notebooks });
  } catch (error: any) {
    console.error("[livo API] Failed to list notebooks:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to list notebooks" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const parsed = createNotebookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid notebook payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const notebook = await createNotebook(user.id, parsed.data);
    return NextResponse.json(notebook, { status: 201 });
  } catch (error: any) {
    console.error("[livo API] Failed to create notebook:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create notebook" },
      { status: 500 },
    );
  }
}
