import Image from "next/image";
import { auth } from "@/lib/auth";
import { Navigation } from "@/app/components/Navigation";
import { ButtonLink } from "@/app/components/ui/ButtonLink";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navigation session={session} />

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
          <ButtonLink href="/gallery" variant="primary" size="lg">
            Se bildegalleri
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
