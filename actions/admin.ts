"use server";

import { auth } from "@/lib/auth";
import { updateUserApproval } from "@/lib/db/users";
import { userApprovalSchema } from "@/lib/validation/schemas";

export async function approveUser(input: { userId: string; approved: boolean }) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("Kun administratorer kan godkjenne brukere");
  }

  const validated = userApprovalSchema.parse(input);

  await updateUserApproval(validated.userId, validated.approved);
}
