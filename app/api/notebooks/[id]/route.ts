import { NextRequest, NextResponse } from "next/server";
import {
  getNotebook,
  updateNotebook,
  deleteNotebook,
  updateNotebookSchema,
} from "@/src/server/modules/notebooks";
import { getCurrentUser } from "@/src/server/modules/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;

    const notebook = await getNotebook(user.id, id);
    if (!notebook) {
      return NextResponse.json(
        { error: "Notebook not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(notebook);
  } catch (error: any) {
    console.error("[livo API] Failed to fetch notebook:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch notebook" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;
    const body = await req.json();

    const parsed = updateNotebookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const updated = await updateNotebook(user.id, id, parsed.data);
    if (!updated) {
      return NextResponse.json(
        { error: "Notebook not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[livo API] Failed to update notebook:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update notebook" },
      { status: error?.message?.includes("already exists") ? 409 : 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await params;

    const success = await deleteNotebook(user.id, id);
    if (!success) {
      return NextResponse.json(
        { error: "Notebook not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notebook deleted and notes unassigned safely",
    });
  } catch (error: any) {
    console.error("[livo API] Failed to delete notebook:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete notebook" },
      { status: 500 },
    );
  }
}
