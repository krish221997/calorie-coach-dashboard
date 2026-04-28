import { ControlledStation } from "@/controlled-components/station/controlled-station";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function StationRoute() {
  return <ControlledStation />;
}
