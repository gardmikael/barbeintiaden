"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import type { Session } from "next-auth";
import { ButtonLink } from "@/app/components/ui/ButtonLink";

interface NavigationProps {
  readonly session: Session | null;
}

export function Navigation({ session }: NavigationProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Lukk meny når man klikker utenfor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo og tittel */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Barbeintiaden logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
            <h1 className="text-xl font-bold text-black dark:text-zinc-50">
              Barbeintiaden
            </h1>
          </Link>

          {/* Navigasjonslenker */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors font-medium"
            >
              Hjem
            </Link>
            <Link
              href="/gallery"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors font-medium"
            >
              Galleri
            </Link>
          </nav>

          {/* Høyre side - innlogging/profil */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Bruker meny"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profil"}
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <svg
                    className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform ${isMenuOpen ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown meny */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 py-1">
                    <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm font-medium text-black dark:text-zinc-50">
                        {session.user.name || "Bruker"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    {session.user.approved && (
                      <Link
                        href="/upload"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Last opp bilde
                      </Link>
                    )}
                    {session.user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Logg ut
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <ButtonLink href="/login" variant="outline">
                Logg inn
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
