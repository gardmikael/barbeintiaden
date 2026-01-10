import { PhotoGalleryServer } from "@/app/components/PhotoGalleryServer";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/app/components/LogoutButton";

export default async function GalleryPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-2xl font-bold text-black dark:text-zinc-50 hover:underline"
              >
                Barbeintiaden
              </Link>
              <span className="text-zinc-400 dark:text-zinc-600">/</span>
              <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
                Bildegalleri
              </h1>
            </div>
            <nav className="flex items-center gap-4">
              {session?.user ? (
                <>
                  {session.user.approved && (
                    <Link
                      href="/upload"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Last opp bilde
                    </Link>
                  )}
                  {session.user.isAdmin && (
                    <Link
                      href="/admin"
                      className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <LogoutButton />
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Logg inn
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PhotoGalleryServer />
      </main>
    </div>
  );
}
