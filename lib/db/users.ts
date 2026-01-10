import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";

export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  approved: boolean;
  is_admin: boolean;
  created_at: string;
}

export async function getPendingUsers(): Promise<User[]> {
  // Bruk admin client for å kunne lese alle brukere (inkludert ikke-godkjente)
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch pending users: ${error.message}`);
  }

  return data || [];
}

export async function updateUserApproval(
  userId: string,
  approved: boolean
): Promise<void> {
  // Bruk admin client for å omgå RLS ved UPDATE
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("users")
    .update({ approved })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user approval: ${error.message}`);
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
}
