import * as React from "react";
import Link from "next/link";
import { AlertTriangle, LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ConnectionBanner({
  kind,
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: {
  kind: "error" | "warning";
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  const palette =
    kind === "error"
      ? "border-[hsl(var(--destructive)/0.35)] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))]"
      : "border-[hsl(var(--warning)/0.35)] bg-[hsl(var(--warning)/0.08)] text-[hsl(var(--warning-foreground))]";
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border px-5 py-4 md:flex-row md:items-center md:justify-between md:gap-4",
        palette,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs opacity-80">{description}</p>
        </div>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          target="_blank"
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-current px-3 py-1 text-xs font-medium hover:opacity-80 md:self-auto"
        >
          <LinkIcon className="h-3 w-3" aria-hidden />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function ConnectionStatus({
  label,
  ok,
}: {
  label: string;
  ok: boolean;
}) {
  return (
    <Badge variant={ok ? "success" : "muted"} className="gap-1.5">
      <span
        aria-hidden
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          ok ? "bg-[hsl(var(--success-foreground))]" : "bg-muted-foreground"
        )}
      />
      {label} {ok ? "connected" : "missing"}
    </Badge>
  );
}
