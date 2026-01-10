import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/app/components/LogoutButton";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Barbeintiaden logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
              <h1 className="text-2xl font-bold text-black dark:text-zinc-50">
                Barbeintiaden
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
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Barbeintiaden logo"
              width={300}
              height={300}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-3xl font-bold text-black dark:text-zinc-50 mb-4">
            Velkommen til Barbeintiaden
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Se bilder fra tidligere arrangementer
          </p>
          <Link
            href="/gallery"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se bildegalleri
          </Link>
        </div>
      </main>
    </div>
  );
}
