import { useLocale } from "../context/LocaleContext";

export function SiteBuildingState({
  error = null,
}: {
  error?: string | null;
}) {
  const { locale } = useLocale();

  const copy =
    locale === "fr"
      ? {
          eyebrow: "Site en preparation",
          title: "Le contenu est en train d'etre charge.",
          description:
            "Nous affichons des blocs d'attente pendant que le vrai contenu du site arrive, pour eviter le basculement bizarre vers un contenu par defaut.",
          detail:
            error ||
            "Si cette page vient d'etre publiee ou modifiee, elle devrait apparaitre ici des que le chargement est termine.",
        }
      : {
          eyebrow: "Site Building",
          title: "The live content is still loading.",
          description:
            "Showing building blocks here keeps the page steady while the real site content arrives, instead of flashing default demo content first.",
          detail:
            error ||
            "If this site was just published or updated, it should appear here as soon as the content request completes.",
        };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              {copy.eyebrow}
            </div>

            <div className="space-y-4">
              <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
              <div className="h-14 max-w-xl animate-pulse rounded-[2rem] bg-muted" />
              <div className="h-6 max-w-2xl animate-pulse rounded-full bg-muted" />
            </div>

            <div className="space-y-3">
              <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {copy.title}
              </p>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.description}
              </p>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {copy.detail}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-border bg-card/70 p-5"
                >
                  <div className="mb-4 h-2 w-12 animate-pulse rounded-full bg-muted" />
                  <div className="space-y-3">
                    <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-4/5 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] border border-border bg-card/80 p-6">
              <div className="mb-5 h-48 animate-pulse rounded-[1.5rem] bg-muted" />
              <div className="space-y-3">
                <div className="h-5 w-32 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card/80 p-6">
              <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-2xl bg-muted"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
