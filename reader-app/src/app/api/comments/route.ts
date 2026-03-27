import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, markId, selectedText, commentText } = body;

    if (!bookId || !markId || !selectedText || !commentText) {
      return NextResponse.json(
        { error: "Missing required fields: bookId, markId, selectedText, commentText" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: { bookId, markId, selectedText, commentText },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("POST /api/comments failed:", error);
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "A comment with this markId already exists for this book" },
        { status: 409 },
      );
    }
    if (prismaError.code === "P2003") {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
