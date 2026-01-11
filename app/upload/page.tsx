import { UploadForm } from "@/components/UploadForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";

export default async function UploadPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navigation session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-black dark:text-zinc-50 mb-6">
          Last opp bilde
        </h1>
        <UploadForm />
      </main>
    </div>
  );
}
