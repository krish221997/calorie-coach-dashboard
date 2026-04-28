export type MealType = "breakfast" | "lunch" | "snack" | "dinner" | "unknown";

export type InputType = "text" | "photo" | "voice" | "unknown";

export interface Meal {
  id: string;
  timestamp: string;
  title: string;
  mealType: MealType;
  inputType: InputType;
  items: string;
  rawInput: string;
  transcript: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  photoUrl?: string;
  notionUrl?: string;
}

export interface DayTotals {
  date: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  mealCount: number;
}

export interface DailyTargets {
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}
