import type { InputHTMLAttributes } from "react";
import type { LocalizedText } from "../../lib/portfolio-content";

interface LocalizedFieldGroupProps {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  englishPlaceholder?: string;
  frenchPlaceholder?: string;
}

export function LocalizedFieldGroup({
  label,
  value,
  onChange,
  disabled = false,
  multiline = false,
  rows = 3,
  type = "text",
  englishPlaceholder,
  frenchPlaceholder,
}: LocalizedFieldGroupProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            English
          </p>
          {multiline ? (
            <textarea
              value={value.en}
              onChange={(event) =>
                onChange({
                  ...value,
                  en: event.target.value,
                })
              }
              rows={rows}
              disabled={disabled}
              className="w-full rounded-lg bg-background border border-border px-4 py-3 text-foreground outline-none resize-none"
              placeholder={englishPlaceholder}
            />
          ) : (
            <input
              type={type}
              value={value.en}
              onChange={(event) =>
                onChange({
                  ...value,
                  en: event.target.value,
                })
              }
              disabled={disabled}
              className="w-full rounded-lg bg-background border border-border px-4 py-3 text-foreground outline-none"
              placeholder={englishPlaceholder}
            />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Francais
          </p>
          {multiline ? (
            <textarea
              value={value.fr}
              onChange={(event) =>
                onChange({
                  ...value,
                  fr: event.target.value,
                })
              }
              rows={rows}
              disabled={disabled}
              className="w-full rounded-lg bg-background border border-border px-4 py-3 text-foreground outline-none resize-none"
              placeholder={frenchPlaceholder}
            />
          ) : (
            <input
              type={type}
              value={value.fr}
              onChange={(event) =>
                onChange({
                  ...value,
                  fr: event.target.value,
                })
              }
              disabled={disabled}
              className="w-full rounded-lg bg-background border border-border px-4 py-3 text-foreground outline-none"
              placeholder={frenchPlaceholder}
            />
          )}
        </div>
      </div>
    </div>
  );
}
