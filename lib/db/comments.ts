import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";

export interface Comment {
  id: string;
  photo_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    name: string;
    image: string;
  };
}

export async function getCommentsByPhotoId(photoId: string): Promise<Comment[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:users(name, image)
    `
    )
    .eq("photo_id", photoId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch comments: ${error.message}`);
  }

  return data || [];
}

export async function createComment(
  photoId: string,
  userId: string,
  content: string
): Promise<Comment> {
  // Bruk admin client for å omgå RLS ved INSERT
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("comments")
    .insert({
      photo_id: photoId,
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`);
  }

  return data;
}
