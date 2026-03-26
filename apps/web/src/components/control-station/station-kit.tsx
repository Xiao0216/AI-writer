import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const toneClasses = {
  amber: "border-[rgba(219,160,92,0.28)] bg-[rgba(255,243,224,0.76)] text-[var(--paper-ink)]",
  cyan: "border-[rgba(87,157,174,0.24)] bg-[rgba(230,244,247,0.72)] text-[var(--paper-ink)]",
  paper: "border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.8)] text-[var(--paper-ink)]",
  danger: "border-[rgba(168,86,78,0.24)] bg-[rgba(255,240,236,0.8)] text-[var(--paper-ink)]",
} as const;

export function StationPanel({
  children,
  className,
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <article
      className={cx(
        "rounded-[1.9rem] border p-5 shadow-[0_18px_48px_rgba(8,18,28,0.06)]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </article>
  );
}

export function SectionHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-3xl">
        <p className="meta-kicker">{kicker}</p>
        <h2 className="panel-title mt-2 text-2xl font-semibold text-[var(--paper-ink)] md:text-[2rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] md:text-[15px]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "paper",
  icon,
}: {
  label: string;
  value: ReactNode;
  detail: string;
  tone?: keyof typeof toneClasses;
  icon?: ReactNode;
}) {
  return (
    <StationPanel tone={tone} className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[var(--ink-soft)]">
            {label}
          </p>
          <div className="mt-3 font-serif text-3xl font-semibold tracking-[-0.04em] text-[var(--paper-ink)]">
            {value}
          </div>
        </div>
        {icon ? <div className="text-[var(--ink-soft)]">{icon}</div> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{detail}</p>
    </StationPanel>
  );
}

export function StatusBadge({
  children,
  tone = "paper",
}: {
  children: ReactNode;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "amber",
}: {
  value: number;
  tone?: "amber" | "cyan";
}) {
  const track =
    tone === "amber"
      ? "from-[rgba(219,160,92,0.95)] to-[rgba(195,120,42,0.92)]"
      : "from-[rgba(99,175,195,0.95)] to-[rgba(55,124,151,0.92)]";

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[rgba(43,56,67,0.08)]">
      <div
        className={cx("h-full rounded-full bg-gradient-to-r", track)}
        style={{ width: `${Math.max(8, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

export function BulletMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(43,56,67,0.08)] py-3 last:border-b-0 last:pb-0 first:pt-0">
      <p className="text-sm text-[var(--ink-soft)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--paper-ink)]">{value}</p>
    </div>
  );
}

export function ChecklistRow({
  label,
  detail,
  passed,
}: {
  label: string;
  detail: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[1.35rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.78)] p-4">
      <div className="mt-0.5">
        {passed ? (
          <CheckCircle2 className="h-4 w-4 text-[#2f6b2f]" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-[var(--accent-danger)]" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--paper-ink)]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{detail}</p>
      </div>
    </div>
  );
}
