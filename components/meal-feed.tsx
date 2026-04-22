import * as React from "react";
import Image from "next/image";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Mic, Image as ImageIcon, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InputType, Meal, MealType } from "@/lib/meals";

const mealTypeCopy: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snack: "Snack",
  dinner: "Dinner",
  unknown: "Meal",
};

function prettyTime(iso: string): string {
  if (!iso) return "";
  try {
    const d = parseISO(iso);
    const rel = formatDistanceToNow(d, { addSuffix: true });
    const hh = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${hh} · ${rel}`;
  } catch {
    return iso;
  }
}

function InputIcon({ type }: { type: InputType }) {
  const base = "h-3 w-3";
  if (type === "voice") return <Mic className={base} aria-hidden />;
  if (type === "photo") return <ImageIcon className={base} aria-hidden />;
  return <MessageCircle className={base} aria-hidden />;
}

function UserBubble({ meal }: { meal: Meal }) {
  const hasPhoto = !!meal.photoUrl;
  const body =
    meal.inputType === "voice"
      ? meal.transcript || meal.rawInput || "(voice note)"
      : meal.rawInput || meal.items;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Badge variant="muted" className="gap-1">
          <InputIcon type={meal.inputType} />
          {meal.inputType === "unknown" ? "text" : meal.inputType}
        </Badge>
        <span>{prettyTime(meal.timestamp)}</span>
      </div>
      <div className="max-w-[78%] rounded-2xl rounded-tr-sm border border-border-secondary/50 bg-card-elevated px-4 py-2.5 text-sm leading-relaxed text-foreground">
        {hasPhoto ? (
          <div className="mb-2 overflow-hidden rounded-lg border border-border">
            <Image
              src={meal.photoUrl!}
              alt="meal photo"
              width={320}
              height={240}
              className="h-auto w-full object-cover"
              unoptimized
            />
          </div>
        ) : null}
        {body || <span className="text-muted-foreground">(empty)</span>}
      </div>
    </div>
  );
}

function CoachBubble({ meal }: { meal: Meal }) {
  const mealLabel = mealTypeCopy[meal.mealType];
  const items = meal.items || meal.rawInput || mealLabel;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-yellow-light font-mono text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--charcoal-dark,0_0%_10%))]">
        cc
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="yellow">{mealLabel}</Badge>
          <span>Coach</span>
        </div>
        <div className="max-w-[78%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground">
          <div>Logged ✓ {items}.</div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            ~{Math.round(meal.kcal)} kcal · {Math.round(meal.proteinG)}g
            protein · {Math.round(meal.fatG)}g fat ·{" "}
            {Math.round(meal.carbsG)}g carbs
          </div>
        </div>
      </div>
    </div>
  );
}

export function MealFeed({
  meals,
  emptyHint,
  className,
}: {
  meals: Meal[];
  emptyHint?: string;
  className?: string;
}) {
  if (meals.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border-secondary bg-card-subtle px-6 py-12 text-center",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          {emptyHint ?? "No meals logged yet."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {meals.map((meal) => (
        <div key={meal.id} className="flex flex-col gap-3">
          <UserBubble meal={meal} />
          <CoachBubble meal={meal} />
        </div>
      ))}
    </div>
  );
}
