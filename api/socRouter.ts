import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, or, type SQL } from "drizzle-orm";
import { z } from "zod";
import { SCENARIOS, SEVERITIES, STATUSES, type IncidentStatus, type ScenarioKey } from "@contracts/soc";
import { activities, incidents, securityEvents } from "@db/schema";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";

const scenarioCatalog: Record<ScenarioKey, {
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  asset: string;
  technique: string;
  techniqueName: string;
  eventType: string;
}> = {
  brute_force: {
    title: "Patrón de fuerza bruta detectado en el servicio de identidad",
    description: "El simulador generó una ráfaga de intentos de autenticación fallidos contra una cuenta corporativa. Revisa el origen, el alcance y si existe un acceso válido posterior.",
    severity: "high",
    source: "Identity Simulator",
    asset: "idp-lab-01",
    technique: "T1110",
    techniqueName: "Brute Force",
    eventType: "authentication",
  },
  phishing: {
    title: "Enlace de phishing dirigido reportado por un usuario",
    description: "El simulador registró un correo con un enlace a una página de recolección de credenciales. Comprueba los destinatarios y bloquea los indicadores asociados.",
    severity: "high",
    source: "Mail Security Simulator",
    asset: "mail-lab-02",
    technique: "T1566.002",
    techniqueName: "Spearphishing Link",
    eventType: "email",
  },
  malware: {
    title: "Comportamiento compatible con malware en un endpoint",
    description: "El simulador generó telemetría de un proceso sospechoso con persistencia y conexión externa. Aísla el activo y valida los artefactos antes de contener.",
    severity: "critical",
    source: "EDR Simulator",
    asset: "ws-lab-017",
    technique: "T1059",
    techniqueName: "Command and Scripting Interpreter",
    eventType: "endpoint",
  },
  privilege_escalation: {
    title: "Elevación de privilegios fuera de la ventana autorizada",
    description: "El simulador detectó un cambio de permisos sobre una cuenta sensible. Verifica la identidad responsable y revierte el cambio si no existe una aprobación válida.",
    severity: "critical",
    source: "Cloud Audit Simulator",
    asset: "cloud-lab-root",
    technique: "T1078",
    techniqueName: "Valid Accounts",
    eventType: "cloud",
  },
};

async function getIncidentDetail(id: number) {
  const db = getDb();
  const [incident] = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  if (!incident) {
    throw new TRPCError({ code: "NOT_FOUND", message: "El incidente no existe." });
  }

  const [timeline, evidence] = await Promise.all([
    db.select().from(activities).where(eq(activities.incidentId, id)).orderBy(desc(activities.createdAt)),
    db.select().from(securityEvents).where(eq(securityEvents.incidentId, id)).orderBy(desc(securityEvents.createdAt)).limit(8),
  ]);

  return { ...incident, timeline, evidence };
}

export const socRouter = createRouter({
  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const [allIncidents, allEvents] = await Promise.all([
      db.select().from(incidents),
      db.select().from(securityEvents),
    ]);

    const now = Date.now();
    const active = allIncidents.filter((incident) => incident.status !== "resolved");
    const open = allIncidents.filter((incident) => ["open", "investigating"].includes(incident.status));
    const critical = active.filter((incident) => incident.severity === "critical");
    const events24h = allEvents.filter((event) => now - event.createdAt.getTime() <= 24 * 60 * 60 * 1000);
    const containedOrResolved = allIncidents.filter((incident) => ["contained", "resolved"].includes(incident.status));

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now - (6 - index) * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        day: new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(date).replace(".", ""),
        events: allEvents.filter((event) => event.createdAt.toISOString().slice(0, 10) === key).length,
      };
    });

    const severityDistribution = SEVERITIES.map((severity) => ({
      severity,
      count: active.filter((incident) => incident.severity === severity).length,
    }));

    const techniques = Object.entries(
      allIncidents.reduce<Record<string, { technique: string; name: string; count: number }>>((acc, incident) => {
        acc[incident.technique] ??= { technique: incident.technique, name: incident.techniqueName, count: 0 };
        acc[incident.technique].count += 1;
        return acc;
      }, {}),
    )
      .map(([, value]) => value)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const severityWeight = { critical: 0, high: 1, medium: 2, low: 3 };
    const recentIncidents = [...allIncidents]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);
    const priorityQueue = [...active]
      .sort((a, b) => severityWeight[a.severity] - severityWeight[b.severity] || a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, 4);

    return {
      metrics: {
        open: open.length,
        critical: critical.length,
        events24h: events24h.length,
        responseCoverage: allIncidents.length ? Math.round((containedOrResolved.length / allIncidents.length) * 100) : 0,
      },
      activity: days,
      severityDistribution,
      techniques,
      recentIncidents,
      priorityQueue,
      lastUpdated: new Date(),
    };
  }),

  list: publicQuery
    .input(
      z.object({
        search: z.string().trim().max(120).optional(),
        severity: z.enum(SEVERITIES).optional(),
        status: z.enum(STATUSES).optional(),
      }),
    )
    .query(async ({ input }) => {
      const conditions: SQL[] = [];
      if (input.search) {
        const term = `%${input.search}%`;
        const searchCondition = or(
          like(incidents.title, term),
          like(incidents.reference, term),
          like(incidents.asset, term),
          like(incidents.technique, term),
        );
        if (searchCondition) conditions.push(searchCondition);
      }
      if (input.severity) conditions.push(eq(incidents.severity, input.severity));
      if (input.status) conditions.push(eq(incidents.status, input.status));

      return getDb()
        .select()
        .from(incidents)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(incidents.updatedAt));
    }),

  byId: publicQuery.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getIncidentDetail(input.id)),

  updateStatus: publicQuery
    .input(z.object({ id: z.number().int().positive(), status: z.enum(STATUSES) }))
    .mutation(async ({ input }) => {
      const current = await getIncidentDetail(input.id);
      if (current.status === input.status) return current;

      const messages: Record<IncidentStatus, string> = {
        open: "Incidente reabierto y devuelto a la cola de triaje.",
        investigating: "Investigación iniciada. Se amplía la recolección de evidencias y el análisis de alcance.",
        contained: "Contención aplicada. Los controles temporales limitan la actividad mientras continúa la monitorización.",
        resolved: "Incidente resuelto. Se validó la ausencia de actividad residual y se archivaron las evidencias.",
      };

      await getDb().transaction(async (tx) => {
        await tx
          .update(incidents)
          .set({
            status: input.status,
            updatedAt: new Date(),
            resolvedAt: input.status === "resolved" ? new Date() : null,
          })
          .where(eq(incidents.id, input.id));
        await tx.insert(activities).values({
          incidentId: input.id,
          type: input.status === "contained" ? "containment" : "status",
          message: messages[input.status],
          actor: "Analista SOC",
        });
      });

      return getIncidentDetail(input.id);
    }),

  simulate: publicQuery.input(z.object({ scenario: z.enum(SCENARIOS) })).mutation(async ({ input }) => {
    const scenario = scenarioCatalog[input.scenario];
    const reference = `INC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const db = getDb();

    const id = await db.transaction(async (tx) => {
      const [{ id: incidentId }] = await tx
        .insert(incidents)
        .values({ ...scenario, reference, assignee: "Sin asignar" })
        .$returningId();
      await tx.insert(securityEvents).values({
        incidentId,
        eventType: scenario.eventType,
        severity: scenario.severity,
        source: scenario.source,
        asset: scenario.asset,
        message: `Evento sintético asociado a ${scenario.technique}; no representa actividad real.`,
      });
      await tx.insert(activities).values({
        incidentId,
        type: "detection",
        message: `Evento sintético generado desde ${scenario.source}. La regla ${scenario.technique} activó la creación automática del incidente.`,
        actor: "Simulador SOC",
      });
      return incidentId;
    });

    return getIncidentDetail(id);
  }),
});
