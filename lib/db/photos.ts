import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  title?: string | null;
  description?: string | null;
  year: number;
  created_at: string;
  user?: {
    name: string;
    image: string;
  };
}

export async function getPhotos(): Promise<Photo[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("photos")
    .select(
      `
      *,
      user:users(name, image)
    `
    )
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch photos: ${error.message}`);
  }

  return data || [];
}

export async function getPhotosByYear(year: number): Promise<Photo[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("photos")
    .select(
      `
      *,
      user:users(name, image)
    `
    )
    .eq("year", year)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch photos: ${error.message}`);
  }

  return data || [];
}

export async function getAvailableYears(): Promise<number[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("photos")
    .select("year")
    .order("year", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch years: ${error.message}`);
  }

  // Hent unike årstall
  const years = Array.from(new Set((data || []).map((p) => p.year))).sort(
    (a, b) => b - a
  );

  return years;
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("photos")
    .select(
      `
      *,
      user:users(name, image)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch photo: ${error.message}`);
  }

  return data;
}

export async function createPhoto(
  userId: string,
  url: string,
  year: number,
  title?: string,
  description?: string
): Promise<Photo> {
  // Bruk admin client for å omgå RLS ved INSERT
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("photos")
    .insert({
      user_id: userId,
      url,
      year,
      title,
      description,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create photo: ${error.message}`);
  }

  return data;
}

export async function deletePhoto(photoId: string): Promise<void> {
  // Bruk admin client for å omgå RLS ved DELETE
  const supabase = createAdminClient();
  
  // Hent bilde-info først for å slette filen fra Storage
  const { data: photo, error: fetchError } = await supabase
    .from("photos")
    .select("url")
    .eq("id", photoId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch photo: ${fetchError.message}`);
  }

  if (!photo) {
    throw new Error("Photo not found");
  }

  // Ekstraher filnavn fra URL (format: https://xxx.supabase.co/storage/v1/object/public/photos/user_id/filename)
  const urlParts = photo.url.split("/photos/");
  if (urlParts.length > 1) {
    const filePath = urlParts[1];
    
    // Slett filen fra Storage
    const { error: storageError } = await supabase.storage
      .from("photos")
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      // Fortsett med å slette fra database selv om Storage-sletting feiler
    }
  }

  // Slett fra database (dette vil også slette kommentarer pga CASCADE)
  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId);

  if (deleteError) {
    throw new Error(`Failed to delete photo: ${deleteError.message}`);
  }
}
