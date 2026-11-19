import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import AppShell from "@/components/layout/AppShell";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Incidents = lazy(() => import("@/pages/Incidents"));
const IncidentDetail = lazy(() => import("@/pages/IncidentDetail"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function RouteLoading() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center" role="status">
      <span className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500">Cargando espacio de trabajo…</span>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
