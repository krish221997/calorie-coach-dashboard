import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  target?: number;
  tone?: "default" | "yellow" | "focus" | "alert" | "success";
  hint?: string;
  className?: string;
}

const toneIndicator: Record<
  NonNullable<StatCardProps["tone"]>,
  string
> = {
  default: "bg-primary",
  yellow: "bg-[hsl(var(--one-yellow))]",
  focus: "bg-[hsl(var(--one-focus))]",
  alert: "bg-[hsl(var(--destructive))]",
  success: "bg-[hsl(var(--success-foreground))]",
};

function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  if (Math.round(n) === n) return String(Math.round(n));
  return n.toFixed(0);
}

export function StatCard({
  label,
  value,
  unit,
  target,
  tone = "default",
  hint,
  className,
}: StatCardProps) {
  const hasTarget = typeof target === "number" && target > 0;
  const pct = hasTarget ? Math.round((value / target!) * 100) : 0;

  return (
    <Card className={cn("gap-3 p-5", className)}>
      <CardContent className="p-0 flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
          {hint ? (
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {hint}
            </span>
          ) : null}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-[44px] leading-none tracking-tight">
            {formatCompact(value)}
          </span>
          {unit ? (
            <span className="text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </div>
        {hasTarget ? (
          <div className="flex flex-col gap-1.5">
            <Progress value={pct} indicatorClassName={toneIndicator[tone]} />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>
                {pct}% of {formatCompact(target!)}
                {unit ? ` ${unit}` : ""}
              </span>
              <span>
                {formatCompact(Math.max(0, target! - value))}
                {unit ? ` ${unit}` : ""} to go
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
