"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { approveUser } from "@/actions/admin";
import Image from "next/image";
import type { User } from "@/lib/db/users";
import { Button } from "@/components/ui/Button";

interface UserApprovalListProps {
  readonly initialUsers: User[];
}

export function UserApprovalList({ initialUsers }: UserApprovalListProps) {
  const { data: session } = useSession();
  const [users, setUsers] = useState(initialUsers);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!session?.user?.isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          Du har ikke tilgang til denne siden
        </p>
      </div>
    );
  }

  const handleApproval = async (userId: string, approved: boolean) => {
    setProcessing(userId);
    setError(null);

    try {
      await approveUser({ userId, approved });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Noe gikk galt");
      }
    } finally {
      setProcessing(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          Ingen ventende brukere å godkjenne
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {users.map((user) => (
        <div
          key={user.id}
          className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-black dark:text-zinc-50">{user.name}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Registrert: {new Date(user.created_at).toLocaleDateString("no-NO")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="success"
              onClick={() => handleApproval(user.id, true)}
              disabled={processing === user.id}
            >
              {processing === user.id ? "Behandler..." : "Godkjenn"}
            </Button>
            <Button
              variant="danger"
              onClick={() => handleApproval(user.id, false)}
              disabled={processing === user.id}
            >
              Avvis
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
