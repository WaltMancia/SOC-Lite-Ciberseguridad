import { severityLabels, statusLabels, type IncidentStatus, type Severity } from "@contracts/soc";
import { cn } from "@/lib/utils";
import { severityDots, severityStyles, statusDots, statusStyles } from "@/lib/soc-utils";

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap", severityStyles[severity])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", severityDots[severity])} aria-hidden="true" />
      {severityLabels[severity]}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap", statusStyles[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", statusDots[status])} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
