import { useState, type ReactNode } from "react";
import { Bug, KeyRound, MailWarning, Play, UserCog } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { SCENARIOS, scenarioLabels, type ScenarioKey } from "@contracts/soc";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SeverityBadge } from "./Badges";

const scenarioDetails: Record<ScenarioKey, { description: string; severity: "critical" | "high" | "medium" | "low"; icon: typeof Bug }> = {
  brute_force: { description: "Ráfaga de accesos fallidos en el proveedor de identidad.", severity: "high", icon: KeyRound },
  phishing: { description: "Correo dirigido con un enlace de robo de credenciales.", severity: "high", icon: MailWarning },
  malware: { description: "Proceso sospechoso con persistencia en un endpoint.", severity: "critical", icon: Bug },
  privilege_escalation: { description: "Cambio no autorizado sobre una cuenta sensible.", severity: "critical", icon: UserCog },
};

export function SimulatorDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scenario, setScenario] = useState<ScenarioKey>("brute_force");
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const simulate = trpc.soc.simulate.useMutation({
    onSuccess: async (incident) => {
      await Promise.all([utils.soc.dashboard.invalidate(), utils.soc.list.invalidate()]);
      setOpen(false);
      toast.success("Incidente generado correctamente", { description: `${incident.reference} ya está en la cola de triaje.` });
      navigate(`/incidents/${incident.id}`);
    },
    onError: (error) => toast.error("No se pudo generar el evento", { description: error.message }),
  });

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!simulate.isPending) setOpen(value); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-5 text-left">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">Generador de telemetría</p>
          <DialogTitle className="mt-1 text-xl tracking-tight text-slate-950">Simular evento de seguridad</DialogTitle>
          <DialogDescription className="mt-1 leading-6 text-slate-600">Crea un incidente persistente con evidencias y línea temporal. Todo el contenido es sintético y seguro para el laboratorio.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2" role="radiogroup" aria-label="Escenario de seguridad">
          {SCENARIOS.map((key) => {
            const item = scenarioDetails[key];
            const Icon = item.icon;
            const selected = scenario === key;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                key={key}
                onClick={() => setScenario(key)}
                className={cn("min-h-36 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2", selected ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}
              >
                <div className="flex items-start justify-between gap-2">
                  <Icon className={cn("h-5 w-5", selected ? "text-blue-700" : "text-slate-500")} strokeWidth={1.7} />
                  <SeverityBadge severity={item.severity} />
                </div>
                <span className="mt-4 block text-sm font-semibold text-slate-950">{scenarioLabels[key]}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">{item.description}</span>
              </button>
            );
          })}
        </div>
        <DialogFooter className="flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center font-mono text-[10px] text-slate-500 sm:text-left">No ejecuta malware ni realiza conexiones externas.</p>
          <Button onClick={() => simulate.mutate({ scenario })} disabled={simulate.isPending} className="min-h-11 rounded-full bg-blue-700 px-5 text-white hover:bg-blue-800">
            <Play className="h-4 w-4" />
            {simulate.isPending ? "Generando incidente…" : "Simular y abrir incidente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
