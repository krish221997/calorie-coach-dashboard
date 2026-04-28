import { ControlledStreaks } from "@/controlled-components/streaks/controlled-streaks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function StreaksRoute() {
  return <ControlledStreaks />;
}
