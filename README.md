# Visibl — SaaS de visibilité IA

Application web (Next.js 16 + Tailwind CSS 4) qui teste si une entreprise est
citée par **ChatGPT**, **Perplexity** et **Gemini** quand on pose les questions
que ses clients posent vraiment, puis délivre des recommandations priorisées.

> Première étape du produit : les réponses des IA sont **simulées**. Aucune
> requête n'est envoyée à OpenAI, Perplexity ou Google. Le code est structuré
> pour brancher les vraies API sans toucher à l'interface (voir plus bas).

## Démarrer

```bash
npm install
npm run dev
```

L'application est disponible sur http://localhost:3000.

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Sert le build de production |
| `npm run typecheck` | Vérification TypeScript |

## Ce que contient cette étape

1. **Landing page** (`/`) — explication du concept, problème adressé,
   fonctionnement en 4 étapes, critères analysés, et le bouton
   « Tester mon site gratuitement ».
2. **Formulaire** — URL du site, secteur d'activité, ville. Validation côté
   client, redirection vers la page de résultats.
3. **Page de résultats** (`/results?url=…&sector=…&city=…`) — score global,
   puis pour chaque IA : badge **Cité** / **Non cité**, score de visibilité
   sur 100, détail des questions posées et 2 à 3 recommandations priorisées.
4. **Route API** (`POST /api/analyze`) — même rapport au format JSON, pour un
   futur widget, une extension ou un tableau de bord client.

Les résultats sont **déterministes** : un même site, secteur et ville
produisent toujours le même rapport (utile pour les démos et les captures).

## Architecture

```
.
├── app/
│   ├── page.tsx                 Landing page
│   ├── results/page.tsx         Rapport (composant serveur, appelle runAudit)
│   ├── results/loading.tsx      Écran de scan pendant l'analyse
│   └── api/analyze/route.ts     POST /api/analyze
├── components/                  UI (formulaire, cartes, jauge, badges)
└── lib/
    ├── types.ts                 Types partagés, sans dépendance framework
    ├── providers/               ← LA COUCHE À BRANCHER
    │   ├── types.ts             Interface AiProvider
    │   ├── mock-engine.ts       Générateur de réponses factices
    │   ├── chatgpt.ts           Adaptateur OpenAI
    │   ├── perplexity.ts        Adaptateur Perplexity
    │   ├── gemini.ts            Adaptateur Google
    │   └── index.ts             Registre + poids dans le score global
    └── audit/
        ├── sectors.ts           Secteurs + gabarits de questions
        ├── questions.ts         Construction des prompts
        ├── brand.ts             URL → marque (nom, domaine)
        ├── scoring.ts           Détection de citation + calcul des scores
        ├── recommendations.ts   Moteur de règles → conseils
        └── run-audit.ts         Orchestration : entrée → rapport
```

Le flux est linéaire et testable étape par étape :

```
AuditInput → buildQuestions → provider.ask() → AiAnswer
          → analyzeAnswer → Probe → scoreProvider → buildRecommendations
          → AuditReport → UI
```

## Brancher les vraies API

Un seul point d'extension : la méthode `ask()` de chaque fournisseur.
Tout le reste — détection de citation, scoring, recommandations, interface —
travaille sur des types neutres et n'a pas à changer.

1. Copier `.env.example` vers `.env.local`, renseigner les clés et passer
   `AI_VISIBILITY_MODE=live`.
2. Dans `lib/providers/chatgpt.ts`, `perplexity.ts` et `gemini.ts`, remplacer
   le corps de `askLive()` par l'appel réseau. Chaque fichier contient en
   en-tête l'endpoint, le format de requête et le mapping vers `AiAnswer`.
3. C'est tout. Un fournisseur sans clé retombe automatiquement sur le mock,
   ce qui permet de basculer les trois IA une par une.

Points à traiter au moment du passage en production :

- **Recherche web obligatoire** : sans outil de recherche (`web_search` pour
  OpenAI, `google_search` pour Gemini), les modèles ne peuvent pas citer de
  commerces locaux. Perplexity le fait nativement.
- **Rate limiting** : `run-audit.ts` lance aujourd'hui les 4 questions d'un
  fournisseur en parallèle. Avec de vraies API, limiter la concurrence.
- **Cache** : un audit coûte 12 appels. Mettre en cache par
  (domaine, secteur, ville) sur 24 h avant d'ouvrir le service au public.
- **Nom de la marque** : `buildBrand()` le devine depuis le domaine. En
  production, le lire dans le `<title>` ou le JSON-LD `Organization` de la
  page d'accueil.

## Ajouter un secteur ou une IA

- **Un secteur** : ajouter une entrée dans `lib/audit/sectors.ts` (libellé,
  gabarits de questions, concurrents d'exemple). Le formulaire et les prompts
  se mettent à jour seuls.
- **Une IA** (Claude, Copilot, Grok…) : créer un fichier sur le modèle de
  `lib/providers/chatgpt.ts`, l'ajouter à `PROVIDERS` et lui donner un poids
  dans `PROVIDER_WEIGHTS`. La landing page et le rapport s'adaptent.

## Calcul du score

Score par IA, sur 100 :

| Signal | Poids | Pourquoi |
|---|---|---|
| Taux de citation | 60 pts | Être nommé est la condition d'entrée |
| Position dans la réponse | 25 pts | Ouvrir la liste n'a pas la valeur d'une 5ᵉ place |
| Lien vers le site | 15 pts | Une mention sans lien n'apporte aucun trafic |

Le score global est la moyenne pondérée des trois IA (`PROVIDER_WEIGHTS`) :
Perplexity et Gemini pèsent plus lourd, car ils sont adossés au web en temps
réel là où ChatGPT dépend davantage de ses données d'entraînement.
