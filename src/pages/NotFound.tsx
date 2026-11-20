import { ArrowLeft, ShieldQuestion } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
      <ShieldQuestion className="h-10 w-10 text-slate-400" strokeWidth={1.4} />
      <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">Error 404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Esta vista no existe</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">La ruta solicitada no forma parte del centro de operaciones. Vuelve al resumen para continuar.</p>
      <Button asChild className="mt-6 rounded-full bg-blue-700 text-white hover:bg-blue-800"><Link to="/"><ArrowLeft className="h-4 w-4" /> Volver al resumen</Link></Button>
    </div>
  );
}
