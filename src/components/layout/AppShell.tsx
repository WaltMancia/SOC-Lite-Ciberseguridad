import { Activity, Database, LayoutDashboard, ShieldCheck, Siren } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { cn } from "@/lib/utils";

const navigation = [
  { to: "/", label: "Resumen", icon: LayoutDashboard },
  { to: "/incidents", label: "Incidentes", icon: Siren },
];

function Brand({ inverted = true }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
      <ShieldCheck className={cn("h-7 w-7", inverted ? "text-blue-400" : "text-blue-700")} strokeWidth={1.7} aria-hidden="true" />
      <span>
        <span className={cn("block text-[17px] font-semibold tracking-[-0.02em]", inverted ? "text-white" : "text-slate-950")}>SOC Lite</span>
        <span className={cn("block font-mono text-[9px] uppercase tracking-[0.2em]", inverted ? "text-slate-400" : "text-slate-500")}>Security operations</span>
      </span>
    </Link>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <nav aria-label="Navegación principal" className="mt-9 space-y-2">
      <p className="mb-3 px-4 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">Operaciones</p>
      {navigation.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", active ? "text-blue-700" : "text-slate-400")} strokeWidth={1.8} />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function EnvironmentNote() {
  return (
    <div className="border-t border-white/10 pt-5">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-300">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Entorno operativo
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">Laboratorio local · Datos 100% sintéticos</p>
      <p className="mt-3 font-mono text-[10px] text-slate-600">SOC LITE / v1.0.0</p>
    </div>
  );
}

export default function AppShell() {
  const location = useLocation();
  return (
    <div className="min-h-[100dvh] bg-[#f6f8fb]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-[#12141f] px-4 py-6 lg:flex">
        <div className="px-3"><Brand /></div>
        <Navigation />
        <div className="mt-auto px-3"><EnvironmentNote /></div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-[#f6f8fb]/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden"><Brand inverted={false} /></div>
            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500 lg:flex">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              Monitorización local
              <span className="text-slate-300">/</span>
              <span className="text-slate-700">Tiempo real simulado</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <Database className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
              <span className="hidden sm:inline">Dataset de laboratorio</span>
              <span className="sm:hidden">Lab</span>
            </div>
          </div>
          <nav aria-label="Navegación móvil" className="flex gap-1 border-t border-slate-200 px-4 py-2 lg:hidden">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => cn("flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full text-xs font-medium", isActive || (to === "/incidents" && location.pathname.startsWith("/incidents")) ? "bg-[#12141f] text-white" : "text-slate-600 hover:bg-slate-200")}>
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
