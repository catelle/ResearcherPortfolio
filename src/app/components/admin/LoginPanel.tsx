import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function LoginPanel({
  initialMode = "signin",
  standalone = false,
}: {
  initialMode?: "signin" | "signup";
  standalone?: boolean;
}) {
  const navigate = useNavigate();
  const {
    isConfigured,
    isEmailVerificationConfigured,
    signIn,
    signUp,
    resendVerification,
  } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setMessage(null);
  }, [initialMode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isConfigured) {
      setMessage(
        "Account sign-in is not ready yet. Add JWT_SECRET alongside your MongoDB settings first.",
      );
      return;
    }

    setSubmitting(true);
    const result =
      mode === "signup"
        ? await signUp(formData.name, formData.email, formData.password)
        : await signIn(formData.email, formData.password);
    setSubmitting(false);
    setMessage(result.message);

    if (result.success) {
      if (mode === "signup") {
        setMode("signin");
        setFormData((current) => ({
          ...current,
          name: "",
          password: "",
        }));
        return;
      }

      navigate("/admin");
    }
  };

  const handleResendVerification = async () => {
    setSubmitting(true);
    const result = await resendVerification(formData.email);
    setSubmitting(false);
    setMessage(result.message);
  };

  return (
    <div className="w-full max-w-xl p-8 rounded-2xl bg-card border border-border shadow-sm">
      <h2 className="text-2xl font-bold text-foreground mb-3">
        {mode === "signup" ? "Create Your Account" : "Admin Sign In"}
      </h2>
      <p className="text-muted-foreground mb-6">
        {mode === "signup"
          ? "Create a Mongo-backed account so you can start building and publishing your own site."
          : "Sign in to continue editing the sites that belong to your account."}
      </p>

      <div className="mb-6 flex gap-2 rounded-xl bg-muted p-1">
        {standalone ? (
          <>
            <Link
              to="/login"
              className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "theme-accent-button"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "theme-accent-button"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "theme-accent-button"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "theme-accent-button"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </>
        )}
      </div>

      {!isConfigured ? (
        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          Account sign-in is not ready yet. Add `JWT_SECRET` with your MongoDB
          settings before using login or registration.
        </div>
      ) : mode === "signup" && !isEmailVerificationConfigured ? (
        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          Email verification is required for new accounts. Add
          `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, and `PUBLIC_APP_URL` before
          creating accounts.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "signup" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none theme-accent-field"
              placeholder="Jane Doe"
              required
            />
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(event) =>
              setFormData({ ...formData, email: event.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none theme-accent-field"
            placeholder="admin@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(event) =>
              setFormData({ ...formData, password: event.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground outline-none theme-accent-field"
            placeholder="Your secure password"
            required
          />
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        {mode === "signin" ? (
          <button
            type="button"
            onClick={() => void handleResendVerification()}
            disabled={!formData.email || submitting}
            className="text-sm theme-accent-text disabled:opacity-50"
          >
            Resend verification email
          </button>
        ) : null}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={
            submitting ||
            !isConfigured ||
            (mode === "signup" && !isEmailVerificationConfigured)
          }
          className="w-full px-6 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {mode === "signup" ? (
            <UserPlus className="w-4 h-4" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {submitting
            ? mode === "signup"
              ? "Creating Account..."
              : "Signing In..."
            : mode === "signup"
              ? "Create Account"
              : "Sign In"}
        </motion.button>
      </form>
    </div>
  );
}
