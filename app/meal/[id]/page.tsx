import { ControlledMeal } from "@/controlled-components/meal/controlled-meal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MealRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ControlledMeal mealId={id} />;
}
