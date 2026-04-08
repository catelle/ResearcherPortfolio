export const DEFAULT_THEME_ACCENT = "#a855f7";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function clamp(value: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function expandHexColor(value: string) {
  if (value.length === 4) {
    return `#${value
      .slice(1)
      .split("")
      .map((character) => character.repeat(2))
      .join("")}`;
  }

  return value.toLowerCase();
}

function parseHexColor(value: string) {
  const normalized = expandHexColor(value);

  return {
    red: Number.parseInt(normalized.slice(1, 3), 16),
    green: Number.parseInt(normalized.slice(3, 5), 16),
    blue: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function toHexChannel(value: number) {
  return clamp(Math.round(value)).toString(16).padStart(2, "0");
}

function mixHexColors(base: string, target: string, amount: number) {
  const start = parseHexColor(base);
  const end = parseHexColor(target);
  const ratio = Math.min(1, Math.max(0, amount));

  return `#${toHexChannel(start.red + (end.red - start.red) * ratio)}${toHexChannel(
    start.green + (end.green - start.green) * ratio,
  )}${toHexChannel(start.blue + (end.blue - start.blue) * ratio)}`;
}

function toRgba(value: string, alpha: number) {
  const { red, green, blue } = parseHexColor(value);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getRelativeLuminance(value: string) {
  const { red, green, blue } = parseHexColor(value);
  const channels = [red, green, blue].map((channel) => {
    const normalized = channel / 255;

    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function normalizeThemeAccentColor(value: string | null | undefined) {
  if (!value) {
    return DEFAULT_THEME_ACCENT;
  }

  const trimmed = value.trim();

  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return DEFAULT_THEME_ACCENT;
  }

  return expandHexColor(trimmed);
}

export function getThemeAccentCssVars(value: string | null | undefined) {
  const accent = normalizeThemeAccentColor(value);
  const luminance = getRelativeLuminance(accent);
  const hover =
    luminance < 0.25
      ? mixHexColors(accent, "#ffffff", 0.18)
      : mixHexColors(accent, "#000000", 0.14);

  return {
    "--theme-accent": accent,
    "--theme-accent-hover": hover,
    "--theme-accent-contrast": luminance > 0.6 ? "#111827" : "#ffffff",
    "--theme-accent-soft": toRgba(accent, 0.3),
    "--theme-accent-faint": toRgba(accent, 0.18),
    "--theme-accent-ring": toRgba(accent, 0.22),
  } as const;
}
