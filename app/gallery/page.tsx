import { PhotoGalleryServer } from "@/components/PhotoGalleryServer";
import { auth } from "@/lib/auth";
import { Navigation } from "@/components/Navigation";

export default async function GalleryPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navigation session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PhotoGalleryServer />
      </main>
    </div>
  );
}
