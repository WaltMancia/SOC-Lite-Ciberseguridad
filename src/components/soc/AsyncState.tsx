import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Cargando información">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-red-200 bg-white px-6 py-12 text-center">
      <AlertCircle className="mb-4 h-7 w-7 text-red-600" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-slate-950">No pudimos conectar con el SOC</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Comprueba que la API y la base de datos estén iniciadas. Tus datos de demostración no se han modificado.</p>
      <Button onClick={onRetry} className="mt-5 rounded-full" variant="outline">
        <RefreshCw className="h-4 w-4" /> Reintentar conexión
      </Button>
    </div>
  );
}
