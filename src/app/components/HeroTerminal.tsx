import { useEffect, useMemo, useState } from "react";

function normalizeLines(lines: string[], fallbackText: string) {
  const normalized = lines
    .map((line) => line.trim())
    .filter(Boolean);

  if (normalized.length > 0) {
    return normalized;
  }

  return ["$ mission", fallbackText];
}

function isCommandLine(line: string) {
  return line.startsWith("$");
}

export function HeroTerminal({
  lines,
  fallbackText,
}: {
  lines: string[];
  fallbackText: string;
}) {
  const sequence = useMemo(
    () => normalizeLines(lines, fallbackText),
    [lines, fallbackText],
  );
  const [lineIndex, setLineIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    setLineIndex(0);
    setTypedChars(0);
  }, [sequence]);

  useEffect(() => {
    if (sequence.length === 0) {
      return;
    }

    if (lineIndex >= sequence.length) {
      const resetTimeout = window.setTimeout(() => {
        setLineIndex(0);
        setTypedChars(0);
      }, 2200);

      return () => {
        window.clearTimeout(resetTimeout);
      };
    }

    const currentLine = sequence[lineIndex];

    if (isCommandLine(currentLine) && typedChars < currentLine.length) {
      const typingTimeout = window.setTimeout(() => {
        setTypedChars((count) => count + 1);
      }, 32);

      return () => {
        window.clearTimeout(typingTimeout);
      };
    }

    const nextLineTimeout = window.setTimeout(() => {
      setLineIndex((index) => index + 1);
      setTypedChars(0);
    }, isCommandLine(currentLine) ? 380 : 780);

    return () => {
      window.clearTimeout(nextLineTimeout);
    };
  }, [lineIndex, typedChars, sequence]);

  const visibleLines = sequence.slice(0, lineIndex);
  const activeLine = sequence[lineIndex];
  const renderedLines =
    activeLine && isCommandLine(activeLine)
      ? [...visibleLines, activeLine.slice(0, typedChars)]
      : [...visibleLines, activeLine].filter(Boolean);

  return (
    <div className="max-w-xl rounded-2xl border theme-accent-panel bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/60">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Mission Terminal
        </span>
      </div>

      <div className="space-y-3 px-5 py-5 font-mono text-sm leading-6">
        {renderedLines.map((line, index) => {
          const isCommand = isCommandLine(line);
          const isActiveCommand =
            index === renderedLines.length - 1 &&
            activeLine &&
            isCommandLine(activeLine) &&
            lineIndex < sequence.length;

          return (
            <div
              key={`${index}-${line}`}
              className={isCommand ? "theme-accent-text" : "text-foreground/85"}
            >
              <span>{line}</span>
              {isActiveCommand ? (
                <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-terminal-caret theme-accent-solid" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
