import { supabase } from "@/lib/supabase";
import type { ModCategory } from "@/lib/database.types";

export interface Recommendation {
  title: string;
  category: ModCategory;
  estimated_price: number;
  difficulty: "facile" | "moyen" | "difficile";
  explanation: string;
}

export async function fetchRecommendations(
  vehicleId: string,
  objective: string,
  budget: number
): Promise<Recommendation[]> {
  const { data, error } = await supabase.functions.invoke<{
    recommendations?: Recommendation[];
    error?: string;
  }>("ai-recommendations", {
    body: { vehicleId, objective, budget },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.recommendations ?? [];
}
