import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { LoginPanel } from "./admin/LoginPanel";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleToggle } from "./LocaleToggle";
import { useAuth } from "../context/AuthContext";

export function AuthPageShell({
  mode,
}: {
  mode: "signin" | "signup";
}) {
  const navigate = useNavigate();
  const { loading, session } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      navigate("/admin", { replace: true });
    }
  }, [loading, navigate, session]);

  if (loading || session) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-border bg-card/80 p-10">
            <div className="grid gap-4">
              <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
              <div className="h-10 w-72 animate-pulse rounded-2xl bg-muted" />
              <div className="h-24 animate-pulse rounded-3xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>

          <div className="flex items-center gap-3">
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,520px)] lg:py-16">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              Portfolio SaaS workspace
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Build client-ready portfolio sites without editing code.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Create an account, open a workspace, save drafts, and publish a
                live site when you are ready. The admin builder stays separate
                from sign-in so the experience feels cleaner for you and for
                future clients.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card/70 p-5">
                <div className="mb-4 h-2 w-12 rounded-full bg-muted" />
                <p className="text-sm text-muted-foreground">
                  Save drafts as often as you want before publishing.
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-card/70 p-5">
                <div className="mb-4 h-2 w-12 rounded-full bg-muted" />
                <p className="text-sm text-muted-foreground">
                  Manage multiple sites from the same Mongo-backed account.
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-card/70 p-5">
                <div className="mb-4 h-2 w-12 rounded-full bg-muted" />
                <p className="text-sm text-muted-foreground">
                  Publish one shared Vercel app now and grow into custom domains later.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <LoginPanel initialMode={mode} standalone />
          </div>
        </div>
      </div>
    </div>
  );
}
