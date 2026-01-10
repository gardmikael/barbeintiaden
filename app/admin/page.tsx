import { UserApprovalList } from "@/app/components/UserApprovalList";
import { getPendingUsers } from "@/lib/db/users";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const pendingUsers = await getPendingUsers();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-black dark:text-zinc-50">
            Administrasjon - Godkjenn brukere
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserApprovalList initialUsers={pendingUsers} />
      </main>
    </div>
  );
}
