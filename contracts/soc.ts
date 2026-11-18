export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export const STATUSES = ["open", "investigating", "contained", "resolved"] as const;
export const SCENARIOS = ["brute_force", "phishing", "malware", "privilege_escalation"] as const;

export type Severity = (typeof SEVERITIES)[number];
export type IncidentStatus = (typeof STATUSES)[number];
export type ScenarioKey = (typeof SCENARIOS)[number];

export const severityLabels: Record<Severity, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export const statusLabels: Record<IncidentStatus, string> = {
  open: "Abierto",
  investigating: "En análisis",
  contained: "Contenido",
  resolved: "Resuelto",
};

export const scenarioLabels: Record<ScenarioKey, string> = {
  brute_force: "Fuerza bruta",
  phishing: "Phishing dirigido",
  malware: "Malware en endpoint",
  privilege_escalation: "Elevación de privilegios",
};
