"use client";

import { useState } from "react";
import { deletePhotoAction } from "@/app/actions/photos-delete";

interface DeletePhotoButtonProps {
  readonly photoId: string;
}

export function DeletePhotoButton({ photoId }: DeletePhotoButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deletePhotoAction(photoId);
      // redirect() i server action vil håndtere redirect
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Noe gikk galt ved sletting");
      }
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Slett bilde
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Er du sikker på at du vil slette dette bildet? Denne handlingen kan ikke angres.
      </p>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDeleting ? "Sletter..." : "Ja, slett"}
        </button>
        <button
          onClick={() => {
            setShowConfirm(false);
            setError(null);
          }}
          disabled={isDeleting}
          className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
