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
  // Last opp til Supabase Storage (bruk admin client for å omgå RLS)
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const fileExt = validated.file.name.split(".").pop();
  const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("photos")
    .upload(fileName, validated.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Kunne ikke laste opp bilde: ${uploadError.message}`);
  }

  // Hent public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(uploadData.path);

  // Lagre metadata i database
  const photo = await createPhoto(
    session.user.id,
    publicUrl,
    validated.year,
    validated.title,
    validated.description
  );

  // Invalider cache for galleri-siden slik at nye bilder vises
  revalidatePath("/gallery");
  revalidatePath("/");

  return photo;
}
