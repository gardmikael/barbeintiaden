import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-4">
          404
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Siden du leter etter finnes ikke
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tilbake til hjemmesiden
        </Link>
      </div>
    </div>
  );
}
