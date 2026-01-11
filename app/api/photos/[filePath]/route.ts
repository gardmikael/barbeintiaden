import { NextRequest, NextResponse } from "next/server";
import { getFilenClient } from "@/lib/filen/client";

interface RouteParams {
  params: Promise<{ filePath: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { filePath: encodedFilePath } = await params;
    
    // Decode the file path (URL was encoded)
    // Replace + with / since encodeURIComponent converts / to %2F, but we need / in paths
    const filePath = decodeURIComponent(encodedFilePath.replaceAll("+", "/"));
    
    // Get Filen.io client
    const client = await getFilenClient();
    
    // Read file from Filen.io
    const fileBuffer = await client.fs().readFile({
      path: filePath,
    });
    
    // Determine content type from file extension
    const extension = filePath.split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    };
    const contentType = contentTypeMap[extension || ""] || "image/jpeg";
    
    // Return file with appropriate headers
    // Convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving photo from Filen.io:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to load image" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
