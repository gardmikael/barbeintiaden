"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { uploadPhoto } from "@/app/actions/photos";
import { photoUploadSchema } from "@/lib/validation/schemas";
import { compressImage } from "@/lib/image/compress";

export function UploadForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Array<{ file: File; preview: string }>>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<number, "pending" | "uploading" | "success" | "error">>({});

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      setPreviews([]);
      return;
    }

    setError(null);
    const newPreviews: Array<{ file: File; preview: string }> = [];

    for (const file of files) {
      try {
        photoUploadSchema.pick({ file: true }).parse({ file });
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
        newPreviews.push({ file, preview });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === "object" && err !== null && "issues" in err) {
          const zodError = err as { issues: Array<{ message: string }> };
          setError(zodError.issues[0]?.message || "Ugyldig fil");
        }
      }
    }

    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!session?.user) {
      setError("Du må være innlogget for å laste opp bilder");
      return;
    }

    if (!session.user.approved) {
      setError("Din bruker er ikke godkjent ennå. Kontakt en administrator.");
      return;
    }

    const yearInput = e.currentTarget.querySelector<HTMLSelectElement>('select[name="year"]');
    const year = yearInput?.value;

    if (!year) {
      setError("Vennligst velg et årstall");
      return;
    }

    if (previews.length === 0) {
      setError("Vennligst velg minst ett bilde");
      return;
    }

    const title = (e.currentTarget.querySelector<HTMLInputElement>('input[name="title"]')?.value || "").trim();
    const description = (e.currentTarget.querySelector<HTMLTextAreaElement>('textarea[name="description"]')?.value || "").trim();

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress({});

      let successCount = 0;
      let errorCount = 0;

      // Last opp bildene sekvensielt
      for (let i = 0; i < previews.length; i++) {
        const { file } = previews[i];

        setUploadProgress((prev) => ({ ...prev, [i]: "uploading" }));

        try {
          // Komprimer bilde på client-side før opplasting
          const compressedFile = await compressImage(file);

          const formData = new FormData();
          formData.set("file", compressedFile);
          formData.set("year", year);
          if (title) formData.set("title", title);
          if (description) formData.set("description", description);

          await uploadPhoto(formData);

          setUploadProgress((prev) => ({ ...prev, [i]: "success" }));
          successCount++;
        } catch (err) {
          setUploadProgress((prev) => ({ ...prev, [i]: "error" }));
          errorCount++;
          console.error(`Error uploading image ${i + 1}:`, err);
        }
      }

      if (errorCount > 0) {
        setError(`${successCount} bilde(r) lastet opp, ${errorCount} feilet`);
      }

      // Redirect til galleri etter opplasting (hvis minst ett bilde var vellykket)
      if (successCount > 0) {
        setTimeout(() => {
          router.push("/gallery");
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Noe gikk galt ved opplasting");
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Du må være innlogget for å laste opp bilder
        </p>
        <a
          href="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Logg inn
        </a>
      </div>
    );
  }

  if (!session.user.approved) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          Din bruker er ikke godkjent ennå. Kontakt en administrator for å få tilgang.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label
          htmlFor="year"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          Årstall *
        </label>
        <select
          id="year"
          name="year"
          required
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUploading}
        >
          <option value="">Velg årstall</option>
          {(() => {
            const currentYear = new Date().getFullYear();
            const startYear = 1988;
            return Array.from(
              { length: currentYear - startYear + 1 },
              (_, i) => currentYear - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ));
          })()}
        </select>
      </div>

      <div>
        <label
          htmlFor="file"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          Velg bilde(r) * (du kan velge flere)
        </label>
        <input
          type="file"
          id="file"
          name="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          required
          className="block w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
          disabled={isUploading}
        />
        {previews.length > 0 && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {previews.length} bilde(r) valgt
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {previews.map((item, index) => (
                <div
                  key={`${item.file.name}-${item.file.size}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900"
                >
                  <Image
                    src={item.preview}
                    alt={`Forhåndsvisning ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {isUploading && uploadProgress[index] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      {uploadProgress[index] === "uploading" && (
                        <span className="text-white text-sm">Laster opp...</span>
                      )}
                      {uploadProgress[index] === "success" && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                      {uploadProgress[index] === "error" && (
                        <span className="text-red-400 text-sm">✗</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          Tittel (valgfritt)
        </label>
        <input
          type="text"
          id="title"
          name="title"
          maxLength={200}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUploading}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-black dark:text-zinc-50 mb-2"
        >
          Beskrivelse (valgfritt)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUploading}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading || previews.length === 0}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {(() => {
          if (isUploading) {
            return `Laster opp ${previews.length} bilde(r)...`;
          }
          const count = previews.length;
          const plural = count !== 1 ? "r" : "";
          return `Last opp ${count} bilde${plural}`;
        })()}
      </button>
    </form>
  );
}
