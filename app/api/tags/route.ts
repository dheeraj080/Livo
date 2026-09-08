import { NextRequest, NextResponse } from "next/server";
import {
  listTags,
  createTag,
  createTagSchema,
} from "@/src/server/modules/tags";
import { getCurrentUser } from "@/src/server/modules/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const tags = await listTags(user.id);
    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error("[livo API] Failed to list tags:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to list tags" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid tag payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const tag = await createTag(user.id, parsed.data);
    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    console.error("[livo API] Failed to create tag:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create tag" },
      { status: 500 },
    );
  }
}
