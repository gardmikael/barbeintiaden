import { ButtonLink } from "@/components/ui/ButtonLink";

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
        <ButtonLink href="/" variant="outline">
          Tilbake til hjemmesiden
        </ButtonLink>
      </div>
    </div>
  );
}
