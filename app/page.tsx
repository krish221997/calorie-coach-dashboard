import { ConnectionBanner } from "@/components/connection-banner";
import { FutureToday } from "@/components/future/future-today";
import { MissionHero } from "@/components/future/mission-hero";
import { StationNav } from "@/components/future/station-nav";
import { DARK } from "@/components/future/tokens";
import {
  aggregateByDay,
  fetchMeals,
  getDailyTargets,
  mealsForDate,
  todayKey,
  totalsForDate,
  type Meal,
} from "@/lib/meals";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const secretMissing = !process.env.ONE_SECRET;
  const sourceMissing = !process.env.NOTION_MEALS_DATA_SOURCE_ID;

  let banner: React.ReactNode = null;
  let meals: Meal[] = [];
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

  const oneOk = !secretMissing && !fetchError;
  const notionOk = connectionOk && !sourceMissing;

  const lastMealTime = latestClock(todaysMeals);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: DARK.bg,
        color: DARK.fg,
      }}
    >
      <StationNav />
      <div style={{ flex: 1, minWidth: 0 }}>
        <MissionHero
          mealCount={todaysMeals.length}
          lastMealTime={lastMealTime}
        />
        <FutureToday
          totals={totals}
          targets={targets}
          todaysMeals={todaysMeals}
          days={days}
          connections={{ notion: notionOk, one: oneOk }}
          banner={banner}
        />
      </div>
    </div>
  );
}

function latestClock(meals: Meal[]): string | null {
  const withTime = meals
    .map((m) => m.timestamp)
    .filter(Boolean)
    .sort();
  if (withTime.length === 0) return null;
  const d = new Date(withTime[withTime.length - 1]);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
