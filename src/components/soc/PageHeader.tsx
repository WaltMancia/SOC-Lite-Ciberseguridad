import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, children }: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-slate-950 md:text-[30px]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 md:text-[15px]">{description}</p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
    </div>
  );
}
