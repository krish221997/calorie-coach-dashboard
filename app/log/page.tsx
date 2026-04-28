import { ControlledLog } from "@/controlled-components/log/controlled-log";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LogRoute() {
  return <ControlledLog />;
}
