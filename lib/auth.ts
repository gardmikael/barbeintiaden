import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createClient } from "./supabase/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          const { createAdminClient } = await import("./supabase/admin");
          const supabase = createAdminClient();
          
          // Sjekk om brukeren allerede eksisterer
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

          // Hvis brukeren ikke eksisterer, opprett den
          if (!existingUser) {
            const { error } = await supabase.from("users").insert({
              email: user.email,
              name: user.name || profile?.name || "",
              image: user.image || profile?.picture || "",
              approved: false,
              is_admin: false,
            });

            if (error) {
              console.error("Error creating user:", error);
              return false;
            }
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const supabase = createClient();
          const { data: user } = await supabase
            .from("users")
            .select("id, approved, is_admin")
            .eq("email", session.user.email)
            .single();

          if (user) {
            session.user.id = user.id;
            session.user.approved = user.approved;
            session.user.isAdmin = user.is_admin;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
