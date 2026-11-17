import { getDb } from "../api/queries/connection";
import { activities, incidents, securityEvents } from "./schema";

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);

const incidentFixtures = [
  {
    reference: "INC-2026-0048",
    title: "Múltiples accesos fallidos seguidos de autenticación válida",
    description: "El servicio de identidad detectó 47 intentos fallidos desde una misma red y un inicio de sesión posterior correcto. La cuenta afectada permanece bloqueada mientras se revisa el origen del acceso.",
    severity: "critical" as const,
    status: "investigating" as const,
    source: "Microsoft Entra ID",
    asset: "idp-prod-01",
    technique: "T1110",
    techniqueName: "Brute Force",
    assignee: "Laura Méndez",
    age: 1.2,
  },
  {
    reference: "INC-2026-0047",
    title: "Ejecución de PowerShell con comando codificado",
    description: "EDR identificó un proceso PowerShell iniciado desde una aplicación de ofimática con un comando codificado en Base64. Se ha aislado el equipo para preservar evidencias.",
    severity: "high" as const,
    status: "contained" as const,
    source: "Defender for Endpoint",
    asset: "ws-fin-042",
    technique: "T1059.001",
    techniqueName: "PowerShell",
    assignee: "Diego Torres",
    age: 3.5,
  },
  {
    reference: "INC-2026-0046",
    title: "Correo con enlace a credenciales corporativas falsas",
    description: "Tres empleados recibieron un mensaje que suplantaba al equipo de soporte. El dominio fue bloqueado y no se han detectado envíos de credenciales.",
    severity: "high" as const,
    status: "open" as const,
    source: "Proofpoint",
    asset: "mail-gateway-02",
    technique: "T1566.002",
    techniqueName: "Spearphishing Link",
    assignee: "Sin asignar",
    age: 5.2,
  },
  {
    reference: "INC-2026-0045",
    title: "Cambio anómalo en grupo de administradores",
    description: "Una cuenta de servicio añadió un usuario al grupo de administradores fuera de la ventana de cambios autorizada.",
    severity: "critical" as const,
    status: "open" as const,
    source: "AWS CloudTrail",
    asset: "aws-prod-root",
    technique: "T1078",
    techniqueName: "Valid Accounts",
    assignee: "Laura Méndez",
    age: 8,
  },
  {
    reference: "INC-2026-0044",
    title: "Conexión periódica a dominio de baja reputación",
    description: "Un endpoint genera conexiones cada diez minutos hacia un dominio registrado recientemente. El tráfico está siendo analizado por el proxy.",
    severity: "medium" as const,
    status: "investigating" as const,
    source: "Zeek Network Sensor",
    asset: "ws-mkt-018",
    technique: "T1071.001",
    techniqueName: "Web Protocols",
    assignee: "Diego Torres",
    age: 14,
  },
  {
    reference: "INC-2026-0043",
    title: "Descarga de herramienta de volcado de credenciales",
    description: "La solución EDR bloqueó la descarga de un binario conocido por extraer credenciales de memoria. No hay indicios de ejecución.",
    severity: "high" as const,
    status: "resolved" as const,
    source: "Defender for Endpoint",
    asset: "srv-dev-006",
    technique: "T1003.001",
    techniqueName: "LSASS Memory",
    assignee: "Nora Salas",
    age: 26,
  },
  {
    reference: "INC-2026-0042",
    title: "Uso de protocolo remoto desde subred no autorizada",
    description: "Se detectó una conexión RDP entre dos segmentos que no tienen una relación de acceso aprobada.",
    severity: "medium" as const,
    status: "contained" as const,
    source: "FortiGate",
    asset: "srv-erp-003",
    technique: "T1021.001",
    techniqueName: "Remote Desktop Protocol",
    assignee: "Nora Salas",
    age: 34,
  },
  {
    reference: "INC-2026-0041",
    title: "Regla de reenvío de correo hacia dominio externo",
    description: "Un buzón creó una regla para reenviar automáticamente los mensajes recibidos a una dirección externa. La regla fue eliminada.",
    severity: "low" as const,
    status: "resolved" as const,
    source: "Microsoft 365",
    asset: "mailbox-legal-07",
    technique: "T1114.002",
    techniqueName: "Email Forwarding Rule",
    assignee: "Diego Torres",
    age: 52,
  },
];

async function seed() {
  const db = getDb();
  const existing = await db.select({ id: incidents.id }).from(incidents).limit(1);

  if (existing.length > 0) {
    console.log("Seed omitido: la base de datos ya contiene incidentes.");
    process.exit(0);
  }

  console.log("Creando dataset de demostración...");
  const incidentIds: number[] = [];

  for (const fixture of incidentFixtures) {
    const [{ id }] = await db
      .insert(incidents)
      .values({
        ...fixture,
        createdAt: hoursAgo(fixture.age),
        updatedAt: hoursAgo(Math.max(0.4, fixture.age - 1.5)),
        resolvedAt: fixture.status === "resolved" ? hoursAgo(fixture.age - 4) : null,
      })
      .$returningId();

    incidentIds.push(id);
    await db.insert(activities).values([
      {
        incidentId: id,
        type: "detection",
        message: `Alerta generada por ${fixture.source} y correlacionada con ${fixture.technique}.`,
        actor: "Motor de correlación",
        createdAt: hoursAgo(fixture.age),
      },
      {
        incidentId: id,
        type: fixture.status === "contained" ? "containment" : "status",
        message:
          fixture.status === "open"
            ? "Incidente incorporado a la cola de triaje. Pendiente de revisión por un analista."
            : fixture.status === "investigating"
              ? "Analista asignado. Recolección de telemetría y validación del alcance en curso."
              : fixture.status === "contained"
                ? "Se aplicaron controles temporales para limitar el alcance. Se mantiene monitorización reforzada."
                : "Verificación completada sin actividad residual. Incidente cerrado con evidencias registradas.",
        actor: fixture.assignee === "Sin asignar" ? "SOC Automation" : fixture.assignee,
        createdAt: hoursAgo(Math.max(0.4, fixture.age - 1.5)),
      },
    ]);
  }

  const eventTypes = ["authentication", "endpoint", "network", "email", "cloud"];
  const severities = ["low", "medium", "high", "critical"] as const;
  const eventValues = Array.from({ length: 56 }, (_, index) => ({
    incidentId: index % 4 === 0 ? incidentIds[index % incidentIds.length] : null,
    eventType: eventTypes[index % eventTypes.length],
    severity: severities[index % 13 === 0 ? 3 : index % 5 === 0 ? 2 : index % 2],
    source: index % 2 === 0 ? "Network Sensor" : "Endpoint Agent",
    asset: index % 2 === 0 ? `srv-prod-${String(index % 8).padStart(2, "0")}` : `ws-corp-${String(index % 30).padStart(3, "0")}`,
    message: "Evento de telemetría normalizado y evaluado por las reglas del laboratorio.",
    createdAt: hoursAgo(index * 2.7 + 0.5),
  }));
  await db.insert(securityEvents).values(eventValues);

  console.log(`Dataset creado: ${incidentIds.length} incidentes y ${eventValues.length} eventos.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error durante el seed:", error);
  process.exit(1);
});
