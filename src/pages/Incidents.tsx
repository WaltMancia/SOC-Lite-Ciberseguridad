import { useDeferredValue, useState } from "react";
import { FilterX, Play, Search, ShieldX } from "lucide-react";
import { useSearchParams } from "react-router";
import { SEVERITIES, STATUSES, severityLabels, statusLabels, type IncidentStatus, type Severity } from "@contracts/soc";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/soc/PageHeader";
import { SimulatorDialog } from "@/components/soc/SimulatorDialog";
import { ErrorState } from "@/components/soc/AsyncState";
import { IncidentTable } from "@/components/soc/IncidentTable";

export default function Incidents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const severityParam = searchParams.get("severity");
  const statusParam = searchParams.get("status");
  const severity = SEVERITIES.includes(severityParam as Severity) ? severityParam as Severity : undefined;
  const status = STATUSES.includes(statusParam as IncidentStatus) ? statusParam as IncidentStatus : undefined;

  const { data, isLoading, isError, refetch } = trpc.soc.list.useQuery({
    search: deferredSearch.trim() || undefined,
    severity,
    status,
  });

  const updateParam = (key: "severity" | "status", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearch("");
    setSearchParams({}, { replace: true });
  };
  const hasFilters = Boolean(search || severity || status);

  return (
    <div>
      <PageHeader eyebrow="Triaje e investigación" title="Gestión de incidentes" description="Explora la cola de trabajo, filtra por prioridad y accede al expediente completo de cada caso.">
        <SimulatorDialog>
          <Button className="min-h-11 rounded-full bg-blue-700 px-5 text-white hover:bg-blue-800"><Play className="h-4 w-4" /> Simular evento</Button>
        </SimulatorDialog>
      </PageHeader>

      <section aria-label="Filtros de incidentes" className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por ID, título, activo o técnica…" aria-label="Buscar incidentes" className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-10 text-sm focus-visible:bg-white focus-visible:ring-blue-600" />
          </div>
          <Select value={severity ?? "all"} onValueChange={(value) => updateParam("severity", value)}>
            <SelectTrigger aria-label="Filtrar por severidad" className="h-11 rounded-lg border-slate-200 bg-white text-sm"><SelectValue placeholder="Severidad" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las severidades</SelectItem>
              {SEVERITIES.map((value) => <SelectItem key={value} value={value}>{severityLabels[value]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status ?? "all"} onValueChange={(value) => updateParam("status", value)}>
            <SelectTrigger aria-label="Filtrar por estado" className="h-11 rounded-lg border-slate-200 bg-white text-sm"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {STATUSES.map((value) => <SelectItem key={value} value={value}>{statusLabels[value]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={clearFilters} disabled={!hasFilters} className="h-11 rounded-lg px-4 text-slate-600 hover:bg-slate-100 hover:text-slate-950"><FilterX className="h-4 w-4" /> Limpiar</Button>
        </div>
      </section>

      <section aria-label="Resultados" className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Cola de incidentes</h2>
            <p className="mt-1 text-xs text-slate-500">{isLoading ? "Consultando registros…" : `${data?.length ?? 0} ${data?.length === 1 ? "resultado" : "resultados"} en el dataset`}</p>
          </div>
          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-slate-500 sm:inline">Orden: actualización</span>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">{[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div>
        ) : isError ? (
          <div className="p-5"><ErrorState onRetry={() => refetch()} /></div>
        ) : data && data.length > 0 ? (
          <IncidentTable incidents={data} />
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <ShieldX className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
            <h3 className="mt-4 text-base font-semibold text-slate-950">No hay incidentes con estos filtros</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">Prueba con otros criterios o restablece la búsqueda para volver a ver toda la cola.</p>
            <Button onClick={clearFilters} variant="outline" className="mt-5 rounded-full"><FilterX className="h-4 w-4" /> Restablecer filtros</Button>
          </div>
        )}
      </section>
    </div>
  );
}
