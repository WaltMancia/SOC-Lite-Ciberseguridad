import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import type { IncidentListItem } from "@/types/soc";
import { formatRelative } from "@/lib/soc-utils";
import { SeverityBadge, StatusBadge } from "./Badges";

export function IncidentTable({ incidents, compact = false }: { incidents: IncidentListItem[]; compact?: boolean }) {
  return (
    <>
      <div className="divide-y divide-slate-100 md:hidden">
        {incidents.map((incident) => (
          <Link key={incident.id} to={`/incidents/${incident.id}`} className="group block px-5 py-5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-medium tracking-wide text-blue-700">{incident.reference}</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-700" />
            </div>
            <h3 className="mt-2 text-sm font-medium leading-6 text-slate-900 group-hover:text-blue-700">{incident.title}</h3>
            <div className="mt-3 flex flex-wrap gap-2"><SeverityBadge severity={incident.severity} /><StatusBadge status={incident.status} /></div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-500">
              <span>{incident.technique} · {incident.asset}</span>
              <span>{formatRelative(incident.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <th className="px-5 py-3 font-medium">Incidente</th>
              <th className="px-4 py-3 font-medium">Severidad</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Activo</th>
              {!compact && <th className="hidden px-4 py-3 font-medium xl:table-cell">Responsable</th>}
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Actualizado</th>
              <th className="w-12 px-3 py-3"><span className="sr-only">Abrir</span></th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80">
                <td className="max-w-md px-5 py-4">
                  <Link to={`/incidents/${incident.id}`} className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                    <span className="mb-1 block font-mono text-[10px] font-medium tracking-wide text-blue-700">{incident.reference}</span>
                    <span className="block text-sm font-medium leading-5 text-slate-900 group-hover:text-blue-700">{incident.title}</span>
                    <span className="mt-1 block font-mono text-[10px] text-slate-500">{incident.technique} · {incident.techniqueName}</span>
                  </Link>
                </td>
                <td className="px-4 py-4"><SeverityBadge severity={incident.severity} /></td>
                <td className="px-4 py-4"><StatusBadge status={incident.status} /></td>
                <td className="hidden px-4 py-4 font-mono text-xs text-slate-600 lg:table-cell">{incident.asset}</td>
                {!compact && <td className="hidden px-4 py-4 text-sm text-slate-600 xl:table-cell">{incident.assignee}</td>}
                <td className="hidden px-4 py-4 text-xs whitespace-nowrap text-slate-500 lg:table-cell">{formatRelative(incident.updatedAt)}</td>
                <td className="px-3 py-4">
                  <Link to={`/incidents/${incident.id}`} aria-label={`Abrir ${incident.reference}`} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
