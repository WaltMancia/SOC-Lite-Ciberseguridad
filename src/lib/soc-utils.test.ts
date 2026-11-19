import { describe, expect, it } from "vitest";
import { SEVERITIES, STATUSES, severityLabels, statusLabels } from "@contracts/soc";
import { formatRelative } from "./soc-utils";

describe("catálogos del SOC", () => {
  it("tiene una etiqueta legible para cada severidad y estado", () => {
    for (const severity of SEVERITIES) expect(severityLabels[severity]).toBeTruthy();
    for (const status of STATUSES) expect(statusLabels[status]).toBeTruthy();
  });
});

describe("formatRelative", () => {
  it("resume fechas recientes en minutos", () => {
    expect(formatRelative(new Date(Date.now() - 5 * 60_000))).toBe("hace 5 min");
  });

  it("resume fechas anteriores en horas", () => {
    expect(formatRelative(new Date(Date.now() - 3 * 60 * 60_000))).toBe("hace 3 h");
  });

  it("no genera valores negativos para fechas futuras", () => {
    expect(formatRelative(new Date(Date.now() + 60_000))).toBe("ahora");
  });
});
