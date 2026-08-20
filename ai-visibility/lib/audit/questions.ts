import type { AuditInput } from "@/lib/types";
import { getSector } from "./sectors";

/**
 * Construit les questions posées aux IA à partir du secteur et de la ville.
 * Ce sont exactement les prompts qui seront envoyés aux vraies API.
 */
export function buildQuestions(input: AuditInput): string[] {
  const sector = getSector(input.sector);
  const city = input.city.trim() || "votre ville";

  return sector.questionTemplates.map((template) =>
    template.replaceAll("{city}", city).replaceAll("{sector}", sector.noun),
  );
}
