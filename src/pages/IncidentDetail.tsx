import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, FileSearch, Laptop, Radio, ScanSearch, ShieldAlert, UserRound } from "lucide-react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { STATUSES, statusLabels, type IncidentStatus } from "@contracts/soc";
import { trpc } from "@/providers/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge, StatusBadge } from "@/components/soc/Badges";
import { ErrorState } from "@/components/soc/AsyncState";
import { formatDateTime, formatDay, formatRelative } from "@/lib/soc-utils";

const timelineIcons = {
  detection: Radio,
  status: ScanSearch,
  note: FileSearch,
  containment: ShieldAlert,
};

export default function IncidentDetail() {
  const { id } = useParams();
  const incidentId = Number(id);
  const validId = Number.isInteger(incidentId) && incidentId > 0;
  const utils = trpc.useUtils();
  const { data: incident, isLoading, isError, refetch } = trpc.soc.byId.useQuery({ id: incidentId }, { enabled: validId });
  const updateStatus = trpc.soc.updateStatus.useMutation({
    onSuccess: async (updated) => {
      await Promise.all([
        utils.soc.byId.invalidate({ id: updated.id }),
        utils.soc.dashboard.invalidate(),
        utils.soc.list.invalidate(),
      ]);
      toast.success("Estado actualizado", { description: `${updated.reference} ahora está ${statusLabels[updated.status].toLowerCase()}.` });
    },
    onError: (error) => toast.error("No se pudo actualizar", { description: error.message }),
  });

  if (isLoading && validId) {
    return <div className="space-y-5"><Skeleton className="h-28 rounded-xl" /><div className="grid gap-5 lg:grid-cols-3"><Skeleton className="h-[520px] rounded-xl lg:col-span-2" /><Skeleton className="h-[520px] rounded-xl" /></div></div>;
  }
  if (!validId || isError || !incident) return <ErrorState onRetry={() => validId && refetch()} />;

  return (
    <div>
      <Link to="/incidents" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><ArrowLeft className="h-4 w-4" /> Volver a incidentes</Link>

      <header className="mb-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-semibold tracking-wide text-blue-700">{incident.reference}</span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 md:text-[28px]">{incident.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" /> Detectado {formatRelative(incident.createdAt)} · {formatDateTime(incident.createdAt)}</p>
          </div>
          <div className="w-full shrink-0 xl:w-56">
            <label htmlFor="incident-status" className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Actualizar estado</label>
            <Select value={incident.status} onValueChange={(status) => updateStatus.mutate({ id: incident.id, status: status as IncidentStatus })} disabled={updateStatus.isPending}>
              <SelectTrigger id="incident-status" className="h-11 w-full rounded-lg border-slate-300 bg-white text-sm font-medium focus:ring-blue-600"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((status) => <SelectItem key={status} value={status}>{statusLabels[status]}</SelectItem>)}</SelectContent>
            </Select>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">{updateStatus.isPending ? "Guardando en la línea temporal…" : "El cambio quedará registrado en la auditoría."}</p>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-semibold text-slate-950">Resumen del incidente</h2></div>
            <div className="px-5 py-5 sm:px-6">
              <p className="text-[15px] leading-7 text-slate-700">{incident.description}</p>
              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Fuente de detección</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800"><Radio className="h-4 w-4 text-blue-700" />{incident.source}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Activo afectado</p>
                  <p className="mt-2 flex items-center gap-2 font-mono text-sm font-medium text-slate-800"><Laptop className="h-4 w-4 text-blue-700" />{incident.asset}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div><h2 className="text-sm font-semibold text-slate-950">Evidencias relacionadas</h2><p className="mt-1 text-xs text-slate-500">Telemetría vinculada al incidente</p></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-600">{incident.evidence.length} eventos</span>
            </div>
            {incident.evidence.length ? (
              <div className="divide-y divide-slate-100">
                {incident.evidence.map((event) => (
                  <div key={event.id} className="px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-700">{event.eventType}</span>
                      <span className="text-[11px] text-slate-500">{formatDay(event.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{event.message}</p>
                    <p className="mt-2 font-mono text-[10px] text-slate-500">{event.source} · {event.asset}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center"><FileSearch className="mx-auto h-6 w-6 text-slate-400" /><p className="mt-3 text-sm text-slate-600">No hay eventos adicionales vinculados a este caso.</p></div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-semibold text-slate-950">Línea temporal de respuesta</h2><p className="mt-1 text-xs text-slate-500">Registro inmutable de la actividad del laboratorio</p></div>
            <div className="px-5 py-5 sm:px-6">
              <ol>
                {incident.timeline.map((activity, index) => {
                  const Icon = timelineIcons[activity.type];
                  return (
                    <li key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {index < incident.timeline.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-slate-200" aria-hidden="true" />}
                      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50"><Icon className="h-3.5 w-3.5 text-slate-600" /></span>
                      <div className="min-w-0 pt-0.5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-semibold text-slate-900">{activity.actor}</p><time className="font-mono text-[10px] text-slate-500">{formatDay(activity.createdAt)}</time></div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{activity.message}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-semibold text-slate-950">Ficha del incidente</h2></div>
            <dl className="divide-y divide-slate-100 px-5">
              <div className="py-4"><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Responsable</dt><dd className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800"><UserRound className="h-4 w-4 text-slate-400" />{incident.assignee}</dd></div>
              <div className="py-4"><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Técnica MITRE ATT&CK</dt><dd className="mt-2"><a href={`https://attack.mitre.org/techniques/${incident.technique.replace(".", "/")}/`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><span className="font-mono">{incident.technique}</span> · {incident.techniqueName}<ExternalLink className="h-3.5 w-3.5" /></a></dd></div>
              <div className="py-4"><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Primera detección</dt><dd className="mt-2 text-sm text-slate-700">{formatDateTime(incident.createdAt)}</dd></div>
              <div className="py-4"><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Última actualización</dt><dd className="mt-2 text-sm text-slate-700">{formatDateTime(incident.updatedAt)}</dd></div>
              {incident.resolvedAt && <div className="py-4"><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Resolución</dt><dd className="mt-2 flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{formatDateTime(incident.resolvedAt)}</dd></div>}
            </dl>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50/70 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-blue-950"><ShieldAlert className="h-4 w-4 text-blue-700" /> Nota de laboratorio</h2>
            <p className="mt-3 text-xs leading-6 text-blue-900/75">Este incidente forma parte de un dataset sintético. Las acciones actualizan la base de datos local, pero no ejecutan contención sobre sistemas reales.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
