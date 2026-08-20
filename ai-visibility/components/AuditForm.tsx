"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DEFAULT_SECTOR_ID, SECTORS } from "@/lib/audit/sectors";
import { isValidUrl } from "@/lib/audit/brand";

type Errors = Partial<Record<"url" | "city", string>>;

const fieldClass =
  "w-full rounded-xl border border-line bg-canvas/70 px-4 py-3 text-ink placeholder:text-ink-muted/60 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/35";

/**
 * Formulaire d'audit : URL + secteur + ville.
 * Il ne fait que valider et rediriger vers /results avec les paramètres —
 * l'analyse est exécutée côté serveur par la page de résultats.
 */
export function AuditForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [sector, setSector] = useState(DEFAULT_SECTOR_ID);
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (!url.trim()) nextErrors.url = "Indiquez l'adresse de votre site.";
    else if (!isValidUrl(url)) nextErrors.url = "Cette adresse ne ressemble pas à un site valide.";
    if (!city.trim()) nextErrors.city = "Indiquez la ville que vous ciblez.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const params = new URLSearchParams({ url: url.trim(), sector, city: city.trim() });
    startTransition(() => router.push(`/results?${params.toString()}`));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={compact ? "" : "space-y-5"}>
      <div className={compact ? "grid gap-4 sm:grid-cols-3" : "grid gap-5 sm:grid-cols-3"}>
        <div className="sm:col-span-3">
          <label htmlFor="url" className="mb-2 block text-sm font-medium text-ink">
            URL de votre site
          </label>
          <input
            id="url"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="garage-dupont.fr"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            aria-invalid={Boolean(errors.url)}
            aria-describedby={errors.url ? "url-error" : undefined}
            className={fieldClass}
          />
          {errors.url ? (
            <p id="url-error" className="mt-2 text-sm text-negative">
              {errors.url}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="sector" className="mb-2 block text-sm font-medium text-ink">
            Secteur d&apos;activité
          </label>
          <select
            id="sector"
            name="sector"
            value={sector}
            onChange={(event) => setSector(event.target.value)}
            className={`${fieldClass} appearance-none`}
          >
            {SECTORS.map((option) => (
              <option key={option.id} value={option.id} className="bg-surface">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city" className="mb-2 block text-sm font-medium text-ink">
            Ville
          </label>
          <input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            placeholder="Lyon"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "city-error" : undefined}
            className={fieldClass}
          />
          {errors.city ? (
            <p id="city-error" className="mt-2 text-sm text-negative">
              {errors.city}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand/90 focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:outline-none disabled:cursor-progress disabled:opacity-70"
      >
        {pending ? "Analyse en cours…" : "Tester mon site gratuitement"}
      </button>

      <p className="mt-3 text-center text-xs text-ink-muted">
        Aucune carte bancaire, aucun compte à créer. Résultat en moins d&apos;une minute.
      </p>
    </form>
  );
}
