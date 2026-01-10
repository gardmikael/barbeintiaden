import { getPhotos, getAvailableYears } from "@/lib/db/photos";
import Link from "next/link";
import Image from "next/image";

export async function PhotoGallery() {
  const photos = await getPhotos();
  const years = await getAvailableYears();

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          Ingen bilder enda. Vær den første til å dele et bilde!
        </p>
      </div>
    );
  }

  // Grupper bilder etter årstall
  const photosByYear = photos.reduce((acc, photo) => {
    if (!acc[photo.year]) {
      acc[photo.year] = [];
    }
    acc[photo.year].push(photo);
    return acc;
  }, {} as Record<number, typeof photos>);

  return (
    <div className="space-y-12">
      {years.map((year) => {
        const yearPhotos = photosByYear[year] || [];
        return (
          <div key={year} className="space-y-4">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
              {year}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {yearPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/photos/${photo.id}`}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900"
                >
                  <Image
                    src={photo.url}
                    alt={photo.title || "Bilde"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {photo.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-medium">{photo.title}</p>
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
