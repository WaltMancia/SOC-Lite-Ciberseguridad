import type { IncidentStatus, Severity } from "@contracts/soc";

export const severityStyles: Record<Severity, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-slate-200 bg-slate-50 text-slate-600",
};

export const severityDots: Record<Severity, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

export const statusStyles: Record<IncidentStatus, string> = {
  open: "border-blue-200 bg-blue-50 text-blue-700",
  investigating: "border-violet-200 bg-violet-50 text-violet-700",
  contained: "border-amber-200 bg-amber-50 text-amber-800",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const statusDots: Record<IncidentStatus, string> = {
  open: "bg-blue-500",
  investigating: "bg-violet-500",
  contained: "bg-amber-500",
  resolved: "bg-emerald-500",
};

export function formatRelative(date: Date) {
  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return "ahora";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDay(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
