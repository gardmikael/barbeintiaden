"use server";

import { auth } from "@/lib/auth";
import { deletePhoto } from "@/lib/db/photos";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deletePhotoAction(photoId: string) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    throw new Error("Kun administratorer kan slette bilder");
  }

  await deletePhoto(photoId);
  
  // Invalider cache for galleri-siden
  revalidatePath("/gallery");
  revalidatePath("/");
  
  redirect("/gallery");
}
