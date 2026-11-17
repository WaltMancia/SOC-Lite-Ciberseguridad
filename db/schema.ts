import {
  bigint,
  index,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const incidents = mysqlTable(
  "incidents",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 32 }).notNull().unique(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull(),
    severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
    status: mysqlEnum("status", ["open", "investigating", "contained", "resolved"])
      .notNull()
      .default("open"),
    source: varchar("source", { length: 100 }).notNull(),
    asset: varchar("asset", { length: 100 }).notNull(),
    technique: varchar("technique", { length: 16 }).notNull(),
    techniqueName: varchar("technique_name", { length: 120 }).notNull(),
    assignee: varchar("assignee", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => ({
    statusIdx: index("incidents_status_idx").on(table.status),
    severityIdx: index("incidents_severity_idx").on(table.severity),
  }),
);

export const activities = mysqlTable(
  "activities",
  {
    id: serial("id").primaryKey(),
    incidentId: bigint("incident_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => incidents.id, { onDelete: "cascade" }),
    type: mysqlEnum("type", ["detection", "status", "note", "containment"]).notNull(),
    message: text("message").notNull(),
    actor: varchar("actor", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    incidentIdx: index("activities_incident_idx").on(table.incidentId),
  }),
);

export const securityEvents = mysqlTable(
  "security_events",
  {
    id: serial("id").primaryKey(),
    incidentId: bigint("incident_id", { mode: "number", unsigned: true }).references(
      () => incidents.id,
      { onDelete: "set null" },
    ),
    eventType: varchar("event_type", { length: 80 }).notNull(),
    severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
    source: varchar("source", { length: 100 }).notNull(),
    asset: varchar("asset", { length: 100 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    createdAtIdx: index("security_events_created_at_idx").on(table.createdAt),
  }),
);

export type Incident = typeof incidents.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type SecurityEvent = typeof securityEvents.$inferSelect;
