import { Activity, ArrowRight, CheckCircle2, Clock3, Play, ShieldAlert, Siren } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { severityLabels, type Severity } from "@contracts/soc";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/soc/PageHeader";
import { SimulatorDialog } from "@/components/soc/SimulatorDialog";
import { DashboardSkeleton, ErrorState } from "@/components/soc/AsyncState";
import { IncidentTable } from "@/components/soc/IncidentTable";
import { SeverityBadge } from "@/components/soc/Badges";
import { formatRelative } from "@/lib/soc-utils";

const chartColors: Record<Severity, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
  low: "#94a3b8",
};

function MetricCard({ label, value, detail, icon: Icon, tone = "blue" }: {
  label: string;
  value: number | string;
  detail: string;
  icon: LucideIcon;
  tone?: "blue" | "red" | "emerald" | "slate";
}) {
  const color = { blue: "text-blue-700", red: "text-red-600", emerald: "text-emerald-600", slate: "text-slate-600" }[tone];
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <p className="mt-4 text-[32px] font-semibold leading-none tracking-[-0.04em] text-slate-950">{value}</p>
      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = trpc.soc.dashboard.useQuery();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;

  const activeTotal = data.severityDistribution.reduce((sum, item) => sum + item.count, 0);
  const maxTechnique = Math.max(...data.techniques.map((item) => item.count), 1);

  return (
    <div>
      <PageHeader eyebrow="Centro de operaciones" title="Resumen de seguridad" description="Prioriza alertas, investiga incidentes y documenta la respuesta desde un único espacio de trabajo.">
        <SimulatorDialog>
          <Button className="min-h-11 rounded-full bg-blue-700 px-5 text-white shadow-sm hover:bg-blue-800">
            <Play className="h-4 w-4" /> Simular evento
          </Button>
        </SimulatorDialog>
      </PageHeader>

      {data.metrics.critical > 0 && (
        <Link to="/incidents?severity=critical" className="group mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 transition-colors hover:bg-red-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">{data.metrics.critical} incidentes críticos requieren atención</p>
              <p className="mt-0.5 text-xs leading-5 text-red-700">Revisa primero los casos activos con mayor impacto potencial.</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 pl-8 text-xs font-semibold text-red-800 sm:pl-0">Ver cola prioritaria <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
      )}

      <section aria-label="Métricas principales" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Incidentes abiertos" value={data.metrics.open} detail="Abiertos o actualmente en análisis" icon={Siren} />
        <MetricCard label="Severidad crítica" value={data.metrics.critical} detail="Casos activos con prioridad inmediata" icon={ShieldAlert} tone="red" />
        <MetricCard label="Eventos · 24 h" value={data.metrics.events24h} detail="Telemetría normalizada en el laboratorio" icon={Activity} tone="slate" />
        <MetricCard label="Cobertura de respuesta" value={`${data.metrics.responseCoverage}%`} detail="Casos contenidos o ya resueltos" icon={CheckCircle2} tone="emerald" />
      </section>

      <section aria-label="Analítica de seguridad" className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
        <article className="min-w-0 rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Actividad de eventos</h2>
              <p className="mt-1 text-xs text-slate-500">Volumen diario durante los últimos siete días</p>
            </div>
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-500"><span className="h-2 w-2 rounded-full bg-blue-600" /> Eventos</span>
          </div>
          <div className="h-64 px-2 pb-2 pt-5 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.activity} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="eventArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0064e6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0064e6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e8edf3" strokeDasharray="3 3" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono Variable" }} dy={8} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 8px 24px rgba(15,23,42,.08)", fontSize: 12 }} labelStyle={{ color: "#0f172a", fontWeight: 600 }} />
                <Area isAnimationActive={false} type="monotone" dataKey="events" name="Eventos" stroke="#0064e6" strokeWidth={2.2} fill="url(#eventArea)" activeDot={{ r: 4, fill: "#0064e6", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-950">Severidad activa</h2>
            <p className="mt-1 text-xs text-slate-500">Distribución de casos pendientes</p>
          </div>
          <div className="grid grid-cols-[140px_1fr] items-center gap-2 px-5 py-5">
            <div className="relative h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie isAnimationActive={false} data={data.severityDistribution} dataKey="count" nameKey="severity" innerRadius={45} outerRadius={62} paddingAngle={3} stroke="none">
                    {data.severityDistribution.map((item) => <Cell key={item.severity} fill={chartColors[item.severity]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold tracking-tight text-slate-950">{activeTotal}</span>
                <span className="font-mono text-[8px] uppercase tracking-wider text-slate-500">activos</span>
              </div>
            </div>
            <div className="space-y-3">
              {data.severityDistribution.map((item) => (
                <div key={item.severity} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[item.severity] }} />{severityLabels[item.severity]}</span>
                  <span className="font-mono font-semibold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 px-5 py-4">
            <h3 className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Técnicas más detectadas</h3>
            <div className="mt-3 space-y-3">
              {data.techniques.map((technique) => (
                <div key={technique.technique}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]"><span className="truncate font-mono text-slate-600">{technique.technique}</span><span className="font-mono text-slate-900">{technique.count}</span></div>
                  <div className="h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#12141f]" style={{ width: `${Math.max(12, (technique.count / maxTechnique) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section aria-label="Incidentes recientes" className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
        <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Actividad reciente</h2>
              <p className="mt-1 text-xs text-slate-500">Últimos incidentes actualizados</p>
            </div>
            <Link to="/incidents" className="flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">Ver todos <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <IncidentTable incidents={data.recentIncidents} compact />
        </article>

        <article className="rounded-xl border border-slate-200 bg-[#12141f] text-white">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold">Cola prioritaria</h2>
            <p className="mt-1 text-xs text-slate-400">Ordenada por severidad y antigüedad</p>
          </div>
          <div className="divide-y divide-white/10 px-5">
            {data.priorityQueue.map((incident) => (
              <Link key={incident.id} to={`/incidents/${incident.id}`} className="group block py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] text-blue-300">{incident.reference}</span>
                  <SeverityBadge severity={incident.severity} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-slate-100 group-hover:text-blue-300">{incident.title}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Clock3 className="h-3 w-3" /> Actualizado {formatRelative(incident.updatedAt)}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
