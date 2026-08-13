import { supabase } from "@/lib/supabase";
import type { ModCategory, ReliabilityPreference, UsageType } from "@/lib/database.types";

export interface Recommendation {
  title: string;
  category: ModCategory;
  estimated_price: number;
  difficulty: "facile" | "moyen" | "difficile";
  explanation: string;
  expected_gain: string;
  reliability_risk: string;
}

export interface Stage {
  title: string;
  recommendations: Recommendation[];
}

export async function fetchPreparationPlan(
  vehicleId: string,
  objective: string,
  budget: number,
  usage: UsageType,
  reliability: ReliabilityPreference
): Promise<Stage[]> {
  const { data, error } = await supabase.functions.invoke<{
    stages?: Stage[];
    error?: string;
  }>("ai-recommendations", {
    body: { vehicleId, objective, budget, usage, reliability },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.stages ?? [];
}
