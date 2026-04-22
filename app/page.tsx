import Link from "next/link";
import { Flame, Wheat, Drumstick, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/stat-card";
import { MealFeed } from "@/components/meal-feed";
import { TrendChart } from "@/components/trend-chart";
import {
  ConnectionBanner,
  ConnectionStatus,
} from "@/components/connection-banner";
import {
  aggregateByDay,
  fetchMeals,
  getDailyTargets,
  mealsForDate,
  todayKey,
  totalsForDate,
} from "@/lib/meals";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MealsResult = Awaited<ReturnType<typeof fetchMeals>>;
type MealRow = MealsResult["meals"][number];

function countInputTypes(meals: MealRow[]) {
  const counts = { text: 0, photo: 0, voice: 0 } as Record<string, number>;
  for (const m of meals) {
    if (m.inputType === "text") counts.text++;
    else if (m.inputType === "photo") counts.photo++;
    else if (m.inputType === "voice") counts.voice++;
  }
  return counts;
}

function prettyToday(): string {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function Home() {
  const secretMissing = !process.env.ONE_SECRET;
  const sourceMissing = !process.env.NOTION_MEALS_DATA_SOURCE_ID;

  let banner: React.ReactNode = null;
  let meals: MealRow[] = [];
  let connectionOk = false;
  let fetchError: string | null = null;

  if (secretMissing || sourceMissing) {
    banner = (
      <ConnectionBanner
        kind="error"
        title="Missing environment"
        description={[
          secretMissing ? "ONE_SECRET is not set." : null,
          sourceMissing ? "NOTION_MEALS_DATA_SOURCE_ID is not set." : null,
          "Copy .env.example → .env.local and fill them in.",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    );
  } else {
    try {
      const res = await fetchMeals(200);
      meals = res.meals;
      connectionOk = res.connectionOk;
      if (!connectionOk) {
        banner = (
          <ConnectionBanner
            kind="warning"
            title="Notion not connected in One"
            description="Add a Notion connection in your One dashboard and make sure it's marked operational."
            actionHref="https://app.withone.ai"
            actionLabel="Open One"
          />
        );
      }
    } catch (err) {
      fetchError = err instanceof Error ? err.message : String(err);
      banner = (
        <ConnectionBanner
          kind="error"
          title="Couldn't load meals"
          description={fetchError}
        />
      );
    }
  }

  const day = todayKey();
  const totals = totalsForDate(meals, day);
  const todaysMeals = mealsForDate(meals, day);
  const targets = getDailyTargets();
  const days = aggregateByDay(meals).slice(0, 30);
  const inputCounts = countInputTypes(todaysMeals);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
      <header className="mb-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-[13px] font-semibold text-[hsl(var(--charcoal-dark,0_0%_10%))]">
              cc
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Calorie Coach
              </span>
              <span className="font-serif text-2xl leading-none">
                {prettyToday()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ConnectionStatus
              label="One"
              ok={!secretMissing && !fetchError}
            />
            <ConnectionStatus label="Notion" ok={connectionOk} />
          </div>
        </div>
        {banner}
      </header>

      <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Calories"
          value={totals.kcal}
          unit="kcal"
          target={targets.kcal}
          tone="default"
          hint={`${totals.mealCount} ${totals.mealCount === 1 ? "meal" : "meals"}`}
        />
        <StatCard
          label="Protein"
          value={totals.proteinG}
          unit="g"
          target={targets.proteinG}
          tone="yellow"
        />
        <StatCard
          label="Fat"
          value={totals.fatG}
          unit="g"
          target={targets.fatG}
          tone="focus"
        />
        <StatCard
          label="Carbs"
          value={totals.carbsG}
          unit="g"
          target={targets.carbsG}
          tone="success"
        />
      </section>

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles
                className="h-4 w-4 text-muted-foreground"
                aria-hidden
              />
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Today&rsquo;s conversation
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              {inputCounts.text > 0 ? (
                <Badge variant="muted" className="gap-1">
                  <Flame className="h-3 w-3" aria-hidden />
                  {inputCounts.text} text
                </Badge>
              ) : null}
              {inputCounts.photo > 0 ? (
                <Badge variant="muted" className="gap-1">
                  <Wheat className="h-3 w-3" aria-hidden />
                  {inputCounts.photo} photo
                </Badge>
              ) : null}
              {inputCounts.voice > 0 ? (
                <Badge variant="muted" className="gap-1">
                  <Drumstick className="h-3 w-3" aria-hidden />
                  {inputCounts.voice} voice
                </Badge>
              ) : null}
            </div>
          </div>
          <MealFeed
            meals={todaysMeals}
            emptyHint="Nothing logged today yet. Send a message to the coach to see it appear here."
          />
        </div>
        <aside className="flex flex-col gap-6">
          <TrendChart days={days} />
          <RecentSidebar
            meals={meals
              .filter((m) => !todaysMeals.find((t) => t.id === m.id))
              .slice(0, 6)}
          />
        </aside>
      </section>

      <Separator className="mb-6" />
      <footer className="flex flex-col gap-1 text-xs text-muted-foreground">
        <p>
          Data comes from your Notion Meals database via One&rsquo;s passthrough
          API. Nothing is cached here &mdash; every page load calls Notion fresh.
        </p>
        <p>
          Daily targets come from env (
          <code className="font-mono">DAILY_KCAL_TARGET</code>,{" "}
          <code className="font-mono">DAILY_PROTEIN_TARGET</code>, etc.) &mdash;
          tweak in <code className="font-mono">.env.local</code>.
        </p>
      </footer>
    </div>
  );
}

function RecentSidebar({ meals }: { meals: MealRow[] }) {
  if (meals.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-card-subtle p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Recent (yesterday &amp; before)
        </h3>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {meals.map((m) => (
          <li
            key={m.id}
            className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="flex flex-col">
              <span className="text-sm">
                {m.items || m.rawInput || "meal"}
              </span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                {m.mealType} ·{" "}
                {m.timestamp ? new Date(m.timestamp).toLocaleDateString() : ""}
              </span>
            </div>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {Math.round(m.kcal)} kcal
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end">
        <Link
          href="https://app.withone.ai"
          target="_blank"
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          View all in One &rarr;
        </Link>
      </div>
    </div>
  );
}
