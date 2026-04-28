import { ControlledToday } from "@/controlled-components/today/controlled-today";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TodayRoute() {
  return <ControlledToday />;
}
