"use server";

import { auth } from "@/lib/auth";
import { createComment as createCommentDb } from "@/lib/db/comments";
import { commentSchema } from "@/lib/validation/schemas";

export async function createComment(input: { content: string; photoId: string }) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Du må være innlogget for å legge til kommentarer");
  }

  const validated = commentSchema.parse(input);

  return createCommentDb(validated.photoId, session.user.id, validated.content);
}
