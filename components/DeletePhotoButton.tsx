"use client";

import { useState } from "react";
import { deletePhotoAction } from "@/actions/photos-delete";
import { Button } from "@/components/ui/Button";

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
      <Button variant="danger" onClick={() => setShowConfirm(true)}>
        Slett bilde
      </Button>
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
        <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Sletter..." : "Ja, slett"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setShowConfirm(false);
            setError(null);
          }}
          disabled={isDeleting}
        >
          Avbryt
        </Button>
      </div>
    </div>
  );
}
