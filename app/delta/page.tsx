import { ControlledDelta } from "@/controlled-components/delta/controlled-delta";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DeltaRoute() {
  return <ControlledDelta />;
}
