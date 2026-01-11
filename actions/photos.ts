"use server";

import { auth } from "@/lib/auth";
import { createPhoto } from "@/lib/db/photos";
import { photoUploadSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export async function uploadPhoto(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Du må være innlogget for å laste opp bilder");
  }

  if (!session.user.approved) {
    throw new Error("Din bruker er ikke godkjent ennå. Kontakt en administrator.");
  }

  const file = formData.get("file") as File;
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const yearStr = formData.get("year") as string | null;

  if (!yearStr) {
    throw new Error("Årstall er påkrevd");
  }

  const year = Number.parseInt(yearStr, 10);

  // Valider input
  const validated = photoUploadSchema.parse({
    file,
    year,
    title: title || undefined,
    description: description || undefined,
  });

  // Filen er allerede komprimert på client-side
  // Last opp til Filen.io
  const { uploadPhoto: uploadPhotoToFilen, getPublicUrl } = await import("@/lib/filen/client");
  
  // Upload til Filen.io
  const filePath = await uploadPhotoToFilen(validated.file, session.user.id);
  
  // Generer public share URL
  const publicUrl = await getPublicUrl(filePath);

  // Lagre metadata i database (inkludert filePath for sletting)
  const photo = await createPhoto(
    session.user.id,
    publicUrl,
    validated.year,
    validated.title,
    validated.description,
    filePath
  );

  // Invalider cache for galleri-siden slik at nye bilder vises
  revalidatePath("/gallery");
  revalidatePath("/");

  return photo;
}
