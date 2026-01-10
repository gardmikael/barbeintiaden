import { getPhotoById } from "@/lib/db/photos";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PhotoCardProps {
  photoId: string;
}

export async function PhotoCard({ photoId }: PhotoCardProps) {
  const photo = await getPhotoById(photoId);

  if (!photo) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={photo.url}
          alt={photo.title || "Bilde"}
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="space-y-2">
        {photo.title && (
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            {photo.title}
          </h1>
        )}
        {photo.description && (
          <p className="text-zinc-600 dark:text-zinc-400">{photo.description}</p>
        )}
        {photo.user && (
          <div className="flex items-center gap-2 pt-2">
            {photo.user.image && (
              <Image
                src={photo.user.image}
                alt={photo.user.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {photo.user.name}
            </span>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              • {new Date(photo.created_at).toLocaleDateString("no-NO")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
