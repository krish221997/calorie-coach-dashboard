import { ControlledReview } from "@/controlled-components/review/controlled-review";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ReviewRoute() {
  return <ControlledReview />;
}
