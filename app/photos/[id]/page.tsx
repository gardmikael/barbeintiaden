import { PhotoCard } from "@/components/PhotoCard";
import { CommentSection } from "@/components/CommentSection";
import { DeletePhotoButton } from "@/components/DeletePhotoButton";
import { getCommentsByPhotoId } from "@/lib/db/comments";
import { auth } from "@/lib/auth";
import { Navigation } from "@/components/Navigation";
import Link from "next/link";

interface PhotoPageProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;
  const session = await auth();
  const comments = await getCommentsByPhotoId(id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navigation session={session} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/gallery"
          className="inline-block mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Tilbake til galleri
        </Link>
        <div className="space-y-6">
          <PhotoCard photoId={id} />
          {session?.user?.isAdmin && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                Administrasjon
              </h3>
              <DeletePhotoButton photoId={id} />
            </div>
          )}
          <CommentSection photoId={id} initialComments={comments} />
        </div>
      </main>
    </div>
  );
}
