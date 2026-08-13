import { supabase } from "@/lib/supabase";

export type CompatibilityStatus = "compatible" | "attention" | "incompatible" | "manquant";

export interface CompatibilityVerdict {
  part: string;
  status: CompatibilityStatus;
  explanation: string;
}

export interface CompatibilityResult {
  summary: string;
  verdicts: CompatibilityVerdict[];
}

export async function checkCompatibility(
  vehicleId: string,
  question: string,
  engine?: string
): Promise<CompatibilityResult> {
  const { data, error } = await supabase.functions.invoke<CompatibilityResult & { error?: string }>(
    "check-compatibility",
    { body: { vehicleId, question, engine } }
  );

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { summary: data?.summary ?? "", verdicts: data?.verdicts ?? [] };
}
