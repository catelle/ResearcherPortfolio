import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle2, LoaderCircle, MailWarning } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { LocaleToggle } from "../components/LocaleToggle";

type VerifyState = "loading" | "success" | "error";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = params.get("token") ?? "";

    if (!token) {
      setState("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const response = await fetch(
          `/api/auth/verify?token=${encodeURIComponent(token)}`,
        );
        const payload = (await response.json()) as { message?: string };

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setState("error");
          setMessage(payload.message || "Unable to verify this email address.");
          return;
        }

        setState("success");
        setMessage(
          payload.message || "Your email has been verified successfully.",
        );
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage(
            "Unable to reach the verification endpoint. Make sure the backend is running.",
          );
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 lg:px-8">
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

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-2xl rounded-[2rem] border border-border bg-card p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              {state === "loading" ? (
                <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : state === "success" ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              ) : (
                <MailWarning className="h-8 w-8 text-amber-500" />
              )}
            </div>

            <h1 className="mt-6 text-3xl font-semibold">
              {state === "loading"
                ? "Verifying your email"
                : state === "success"
                  ? "Email verified"
                  : "Verification issue"}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {message}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 theme-accent-button"
              >
                Go to sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-foreground transition-colors hover:bg-accent"
              >
                Back to registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
