import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp", // Prøv WebP først
  };

  const compressionOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    // Hvis WebP feiler, prøv JPEG
    if (compressionOptions.fileType === "image/webp") {
      return compressImage(file, {
        ...compressionOptions,
        fileType: "image/jpeg",
      });
    }
    throw error;
  }
}
