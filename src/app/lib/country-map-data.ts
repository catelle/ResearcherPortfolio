interface CountryMapPoint {
  code: string;
  lat: number;
  lng: number;
}

const countryPoints: CountryMapPoint[] = [
  { code: "AE", lat: 24.3, lng: 54.4 },
  { code: "AO", lat: -12.3, lng: 17.6 },
  { code: "AR", lat: -38.4, lng: -63.6 },
  { code: "AT", lat: 47.6, lng: 14.1 },
  { code: "AU", lat: -25.3, lng: 133.8 },
  { code: "BD", lat: 23.7, lng: 90.4 },
  { code: "BE", lat: 50.8, lng: 4.5 },
  { code: "BF", lat: 12.3, lng: -1.6 },
  { code: "BG", lat: 42.7, lng: 25.5 },
  { code: "BI", lat: -3.4, lng: 29.9 },
  { code: "BJ", lat: 9.3, lng: 2.3 },
  { code: "BW", lat: -22.3, lng: 24.7 },
  { code: "BR", lat: -14.2, lng: -51.9 },
  { code: "CA", lat: 56.1, lng: -106.3 },
  { code: "CD", lat: -2.9, lng: 23.7 },
  { code: "CF", lat: 6.6, lng: 20.9 },
  { code: "CG", lat: -0.2, lng: 15.8 },
  { code: "CH", lat: 46.8, lng: 8.2 },
  { code: "CI", lat: 7.5, lng: -5.5 },
  { code: "CL", lat: -35.7, lng: -71.5 },
  { code: "CM", lat: 5.7, lng: 12.7 },
  { code: "CN", lat: 35.8, lng: 104.1 },
  { code: "CO", lat: 4.6, lng: -74.1 },
  { code: "CZ", lat: 49.8, lng: 15.5 },
  { code: "DE", lat: 51.2, lng: 10.4 },
  { code: "DJ", lat: 11.8, lng: 42.6 },
  { code: "DK", lat: 56.2, lng: 10.0 },
  { code: "DZ", lat: 28.0, lng: 3.0 },
  { code: "EG", lat: 26.8, lng: 30.8 },
  { code: "ER", lat: 15.3, lng: 39.8 },
  { code: "ES", lat: 40.3, lng: -3.7 },
  { code: "ET", lat: 9.1, lng: 40.5 },
  { code: "FI", lat: 64.5, lng: 26.0 },
  { code: "FR", lat: 46.2, lng: 2.2 },
  { code: "GA", lat: -0.6, lng: 11.8 },
  { code: "GB", lat: 54.5, lng: -2.5 },
  { code: "GH", lat: 7.9, lng: -1.0 },
  { code: "GM", lat: 13.4, lng: -15.3 },
  { code: "GN", lat: 10.4, lng: -10.9 },
  { code: "GR", lat: 39.0, lng: 22.0 },
  { code: "GW", lat: 11.8, lng: -15.2 },
  { code: "ID", lat: -2.5, lng: 118.0 },
  { code: "IE", lat: 53.3, lng: -8.0 },
  { code: "IL", lat: 31.5, lng: 34.8 },
  { code: "IN", lat: 22.9, lng: 79.7 },
  { code: "IT", lat: 42.8, lng: 12.5 },
  { code: "JP", lat: 36.2, lng: 138.3 },
  { code: "KE", lat: 0.1, lng: 37.9 },
  { code: "KM", lat: -11.7, lng: 43.3 },
  { code: "KR", lat: 36.5, lng: 127.8 },
  { code: "LS", lat: -29.6, lng: 28.2 },
  { code: "LR", lat: 6.4, lng: -9.3 },
  { code: "LY", lat: 27.0, lng: 17.0 },
  { code: "MA", lat: 31.8, lng: -7.1 },
  { code: "MG", lat: -19.4, lng: 46.8 },
  { code: "ML", lat: 17.6, lng: -3.9 },
  { code: "MR", lat: 20.2, lng: -10.4 },
  { code: "MU", lat: -20.3, lng: 57.6 },
  { code: "MW", lat: -13.4, lng: 34.3 },
  { code: "MX", lat: 23.6, lng: -102.5 },
  { code: "MY", lat: 4.2, lng: 102.0 },
  { code: "MZ", lat: -18.7, lng: 35.5 },
  { code: "NA", lat: -22.6, lng: 17.1 },
  { code: "NE", lat: 17.6, lng: 9.6 },
  { code: "NG", lat: 9.1, lng: 8.7 },
  { code: "NL", lat: 52.1, lng: 5.3 },
  { code: "NO", lat: 61.0, lng: 8.5 },
  { code: "NZ", lat: -41.3, lng: 174.8 },
  { code: "PE", lat: -9.2, lng: -75.0 },
  { code: "PH", lat: 12.8, lng: 121.8 },
  { code: "PK", lat: 30.4, lng: 69.3 },
  { code: "PL", lat: 52.1, lng: 19.1 },
  { code: "PT", lat: 39.5, lng: -8.0 },
  { code: "QA", lat: 25.3, lng: 51.2 },
  { code: "RO", lat: 45.8, lng: 24.9 },
  { code: "RS", lat: 44.0, lng: 20.8 },
  { code: "RU", lat: 61.5, lng: 105.3 },
  { code: "RW", lat: -1.9, lng: 29.9 },
  { code: "SA", lat: 23.9, lng: 45.1 },
  { code: "SC", lat: -4.7, lng: 55.5 },
  { code: "SD", lat: 15.5, lng: 32.5 },
  { code: "SE", lat: 62.1, lng: 15.0 },
  { code: "SG", lat: 1.35, lng: 103.8 },
  { code: "SL", lat: 8.5, lng: -11.8 },
  { code: "SN", lat: 14.4, lng: -14.4 },
  { code: "SO", lat: 5.2, lng: 46.2 },
  { code: "SS", lat: 7.8, lng: 30.0 },
  { code: "TH", lat: 15.8, lng: 101.0 },
  { code: "TG", lat: 8.6, lng: 0.8 },
  { code: "TN", lat: 34.1, lng: 9.6 },
  { code: "TR", lat: 39.0, lng: 35.2 },
  { code: "TZ", lat: -6.3, lng: 34.8 },
  { code: "UA", lat: 49.0, lng: 31.3 },
  { code: "UG", lat: 1.4, lng: 32.3 },
  { code: "US", lat: 39.8, lng: -98.6 },
  { code: "VE", lat: 7.0, lng: -66.0 },
  { code: "VN", lat: 16.1, lng: 107.8 },
  { code: "ZA", lat: -29.0, lng: 24.0 },
  { code: "ZM", lat: -13.1, lng: 27.8 },
  { code: "ZW", lat: -19.0, lng: 29.2 },
];

const regionDisplayNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export function getCountryMapDisplayName(code: string) {
  const normalized = code.toUpperCase();

  return regionDisplayNames?.of(normalized) ?? normalized;
}

export const countryMapOptions = [...countryPoints]
  .map((country) => ({
    ...country,
    name: getCountryMapDisplayName(country.code),
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

export function getCountryMapPoint(code: string | null | undefined) {
  if (!code) {
    return null;
  }

  const normalized = code.toUpperCase();
  return countryMapOptions.find((country) => country.code === normalized) ?? null;
}

export function getCountryFlagUrl(code: string) {
  return `https://flagcdn.com/w80/${code.toLowerCase()}.webp`;
}
