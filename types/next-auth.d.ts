import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      approved: boolean;
      isAdmin: boolean;
    };
  }

  interface User {
    id: string;
    approved: boolean;
    isAdmin: boolean;
  }
}
