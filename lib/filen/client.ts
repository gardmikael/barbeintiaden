import { FilenSDK } from "@filen/sdk";
import path from "node:path";
import os from "node:os";

let filenClient: FilenSDK | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

async function initializeFilenClient(): Promise<FilenSDK> {
  if (filenClient) {
    return filenClient;
  }

  if (isInitializing && initPromise) {
    await initPromise;
    if (filenClient) {
      return filenClient;
    }
  }

  isInitializing = true;
  initPromise = (async () => {
    const filenEmail = process.env.FILEN_EMAIL;
    const filenPassword = process.env.FILEN_PASSWORD;
    const filen2FACode = process.env.FILEN_2FA_CODE;

    if (!filenEmail || !filenPassword) {
      throw new Error("Missing Filen.io credentials. Please set FILEN_EMAIL and FILEN_PASSWORD environment variables.");
    }

    const client = new FilenSDK({
      metadataCache: true,
      connectToSocket: true,
      tmpPath: path.join(os.tmpdir(), "filen-sdk"),
    });

    try {
      await client.login({
        email: filenEmail,
        password: filenPassword,
        twoFactorCode: filen2FACode || undefined,
      });

      filenClient = client;
      isInitializing = false;
    } catch (error) {
      isInitializing = false;
      throw new Error(`Failed to initialize Filen.io client: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  })();

  await initPromise;
  
  if (!filenClient) {
    throw new Error("Failed to initialize Filen.io client");
  }

  return filenClient;
}

export async function getFilenClient(): Promise<FilenSDK> {
  return initializeFilenClient();
}

/**
 * Upload a photo to Filen.io
 * @param file - The file to upload
 * @param userId - The user ID for organizing files
 * @returns The file path in Filen.io
 */
export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const client = await getFilenClient();
  const photosFolder = process.env.FILEN_PHOTOS_FOLDER || "/barbeintiaden/photos";
  
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Generate file path: /barbeintiaden/photos/{userId}/{timestamp}.{ext}
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${photosFolder}/${userId}/${fileName}`;
  
  // Ensure directory exists (create parent directories if needed)
  const dirPath = `${photosFolder}/${userId}`;
  try {
    await client.fs().mkdir({
      path: dirPath,
    });
  } catch {
    // Directory might already exist, ignore error
  }
  
  // Upload file
  await client.fs().writeFile({
    path: filePath,
    content: buffer,
  });
  
  return filePath;
}

/**
 * Get a URL for a file in Filen.io (via our API proxy route)
 * @param filePath - The file path in Filen.io
 * @returns The API proxy URL
 */
export async function getPublicUrl(filePath: string): Promise<string> {
  // Since Filen.io free tier doesn't support public links,
  // we use our own API route to proxy the files
  const encodedPath = encodeURIComponent(filePath);
  return `/api/photos/${encodedPath}`;
}

/**
 * Delete a photo from Filen.io
 * @param filePath - The file path in Filen.io to delete
 */
export async function deletePhoto(filePath: string): Promise<void> {
  const client = await getFilenClient();
  
  try {
    await client.fs().unlink({
      path: filePath,
      permanent: true, // Permanently delete (not move to trash)
    });
  } catch (error) {
    // File might not exist, log but don't throw
    console.error(`Failed to delete file ${filePath}:`, error);
    // Don't throw error - allow deletion to continue even if file doesn't exist in Filen
  }
}
