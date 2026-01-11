import { UserApprovalList } from "@/components/UserApprovalList";
import { getPendingUsers } from "@/lib/db/users";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const pendingUsers = await getPendingUsers();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navigation session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-black dark:text-zinc-50 mb-6">
          Administrasjon - Godkjenn brukere
        </h1>
        <UserApprovalList initialUsers={pendingUsers} />
      </main>
    </div>
  );
}
