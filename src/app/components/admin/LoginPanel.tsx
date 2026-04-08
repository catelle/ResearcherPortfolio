import { useState } from "react";
import { motion } from "motion/react";
import { LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function LoginPanel() {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await signIn(formData.email, formData.password);
    setSubmitting(false);
    setMessage(result.message);
  };

  return (
    <div className="max-w-xl p-8 rounded-2xl bg-card border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Admin Sign In
      </h2>
      <p className="text-muted-foreground mb-6">
        Sign in with the same Supabase admin account used by your other portfolio
        so edits can be written to MongoDB remotely.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={submitting}
          className="w-full px-6 py-3 theme-accent-button rounded-lg font-medium disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          {submitting ? "Signing In..." : "Sign In"}
        </motion.button>
      </form>
    </div>
  );
}
