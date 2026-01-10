"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { createComment } from "@/app/actions/comments";
import { commentSchema } from "@/lib/validation/schemas";
import Image from "next/image";
import type { Comment } from "@/lib/db/comments";
import { Button } from "@/app/components/ui/Button";

interface CommentSectionProps {
  photoId: string;
  initialComments: Comment[];
}

export function CommentSection({ photoId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!session?.user) {
      setError("Du må være innlogget for å legge til kommentarer");
      return;
    }

    try {
      const validatedData = commentSchema.parse({
        content,
        photoId,
      });

      setIsSubmitting(true);
      const newComment = await createComment(validatedData);

      setComments([...comments, newComment]);
      setContent("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null && "issues" in err) {
        const zodError = err as { issues: Array<{ message: string }> };
        setError(zodError.issues[0]?.message || "Valideringsfeil");
      } else {
        setError("Noe gikk galt");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Logg inn
          </a>{" "}
          for å legge til kommentarer
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
        Kommentarer ({comments.length})
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Skriv en kommentar..."
            rows={3}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Sender..." : "Legg til kommentar"}
        </Button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            Ingen kommentarer enda. Vær den første!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
            >
              <div className="flex items-start gap-3">
                {comment.user?.image && (
                  <Image
                    src={comment.user.image}
                    alt={comment.user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-black dark:text-zinc-50">
                      {comment.user?.name || "Anonym"}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(comment.created_at).toLocaleDateString("no-NO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
