import { getPhotos, getAvailableYears } from "@/lib/db/photos";
import { PhotoGallery } from "./PhotoGallery";

export async function PhotoGalleryServer() {
  const photos = await getPhotos();
  const years = await getAvailableYears();

  return <PhotoGallery initialPhotos={photos} initialYears={years} />;
}
