import { NextResponse } from "next/server";
import { isValidUrl } from "@/lib/audit/brand";
import { runAudit } from "@/lib/audit/run-audit";
import { DEFAULT_SECTOR_ID, SECTORS } from "@/lib/audit/sectors";
import type { AuditInput } from "@/lib/types";

/**
 * POST /api/analyze
 * Body : { url: string, sector?: string, city: string }
 * Renvoie le même `AuditReport` que la page /results.
 *
 * La page de résultats appelle `runAudit` directement (composant serveur) ;
 * cette route existe pour les usages externes : widget embarqué, extension,
 * tests, futur tableau de bord client.
 */
export async function POST(request: Request) {
  let body: Partial<AuditInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête JSON invalide." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const sector = typeof body.sector === "string" ? body.sector : DEFAULT_SECTOR_ID;

  if (!isValidUrl(url)) {
    return NextResponse.json({ error: "URL de site invalide." }, { status: 400 });
  }
  if (!city) {
    return NextResponse.json({ error: "La ville est obligatoire." }, { status: 400 });
  }
  if (!SECTORS.some((entry) => entry.id === sector)) {
    return NextResponse.json({ error: "Secteur d'activité inconnu." }, { status: 400 });
  }

  const report = await runAudit({ url, sector, city });
  return NextResponse.json(report);
}
