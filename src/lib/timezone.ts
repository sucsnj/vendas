export const RECIFE_TZ = "America/Recife";

export function toDayReference(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RECIFE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function nowUtcIso(): string {
  return new Date().toISOString();
}

export function formatRecife(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: RECIFE_TZ,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}
