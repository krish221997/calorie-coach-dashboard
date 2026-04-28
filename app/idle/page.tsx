import { ControlledIdle } from "@/controlled-components/idle/controlled-idle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function IdleRoute() {
  return <ControlledIdle />;
}
