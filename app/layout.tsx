import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visibl — Êtes-vous cité par les IA ?",
  description:
    "Testez gratuitement si ChatGPT, Perplexity et Gemini recommandent votre entreprise, et recevez un plan d'action pour y apparaître.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
