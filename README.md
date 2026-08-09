# Carnet Garage

App mobile (React Native + Expo) pour documenter, suivre et partager les modifications
esthétiques et mécaniques de sa voiture ou sa moto, avec des recommandations IA et un
suivi d'entretien classique. Basée sur le cahier des charges fourni — voir `AGENTS.md`
pour les notes spécifiques à la version d'Expo utilisée.

> « Carnet Garage » est un nom provisoire — changez `name`/`slug` dans `app.json` et
> `name` dans `package.json` à volonté.

## Stack

| Besoin | Outil |
|---|---|
| App iOS + Android + Web | Expo Router (React Native) |
| Backend / base de données | Supabase (PostgreSQL, Auth, Storage) |
| IA recommandations | API Anthropic (Claude), via une Edge Function Supabase |
| Abonnements | RevenueCat (non connecté dans ce scaffold, voir plus bas) |

## Tester rapidement sans backend (mode démo)

Pour voir l'app tourner sur votre téléphone en quelques minutes, sans créer de
projet Supabase :

```bash
npm install
cp .env.example .env
```

Puis décommentez `EXPO_PUBLIC_PREVIEW=1` dans `.env`, et lancez :

```bash
npx expo start
```

Scannez le QR code affiché avec l'app **Expo Go** (iOS/Android, gratuite) — le
téléphone et l'ordinateur doivent être sur le même réseau Wi-Fi. L'app se lance
avec un compte et des données factices déjà chargés (véhicules, modifications,
entretien, communauté) : aucune connexion n'est nécessaire, rien n'est
sauvegardé. Pratique pour explorer l'app ou faire des captures d'écran.

Pour passer au vrai backend ensuite, il suffit de retirer/commenter
`EXPO_PUBLIC_PREVIEW` et de suivre la section suivante.

## Démarrage (avec un vrai backend Supabase)

### 1. Dépendances

```bash
npm install
```

### 2. Créer un projet Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans l'éditeur SQL, exécutez `supabase/migrations/0001_init.sql` (tables, RLS,
   triggers de notifications, bucket de stockage `vehicle-photos`).
3. Copiez `.env.example` vers `.env` et renseignez :
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_WEB_URL` (une fois la version web déployée — sert à générer les
     liens publics partageables des véhicules)
4. Dans **Authentication > Providers**, activez Email (et Google/Apple si besoin —
   non câblés dans ce scaffold, à ajouter via `expo-auth-session`).

### 3. Déployer la fonction de recommandations IA

```bash
npx supabase login
npx supabase link --project-ref <votre-ref-projet>
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
npx supabase functions deploy ai-recommendations
```

La fonction (`supabase/functions/ai-recommendations`) vérifie que l'utilisateur est
propriétaire du véhicule, appelle l'API Claude côté serveur (la clé API n'est jamais
exposée au client) et renvoie une liste structurée de recommandations en JSON.

### 4. Lancer l'app

```bash
npm run start   # puis 'i' (iOS), 'a' (Android) ou 'w' (web)
```

## Structure du projet

```
app/                      Écrans (Expo Router — routage par fichiers)
  (auth)/                 Connexion / inscription
  (tabs)/                 Garage, Communauté, Entretien, Profil
  vehicle/[id].tsx         Page publique partageable d'un véhicule
components/                Composants UI réutilisables
context/AuthContext.tsx    Session Supabase + profil utilisateur
lib/                       Client Supabase, requêtes, thème
supabase/
  migrations/0001_init.sql Schéma complet (tables, RLS, triggers, storage)
  functions/ai-recommendations/  Edge Function appelant l'API Claude
```

## Ce qui est fonctionnel dans ce scaffold

- Inscription / connexion email + mot de passe, profil auto-créé (trigger SQL).
- Garage : création de véhicule (voiture/moto), photo de couverture, journal de
  modifications avec catégories, prix et calcul automatique du budget total.
- Recommandations IA (formulaire objectif + budget → appel Edge Function → Claude).
- Page publique partageable par véhicule + bouton de partage natif.
- Communauté : fil d'abonnements, découverte de véhicules publics, likes, follow,
  notifications in-app (follow, nouvelle modif, like, commentaire) via triggers SQL.
- Entretien : ajout d'échéances (vidange, pneus, contrôle technique, freins...),
  indicateur en retard / bientôt / à jour, marquage comme fait.
- Profil + écran d'abonnement (maquette, sans paiement réel branché).

## Ce qui reste à faire pour une V1 complète

- **RevenueCat** : le paiement n'est pas connecté. `profiles.is_premium` et
  `subscriptions.is_active` existent en base mais doivent être mis à jour par un
  webhook RevenueCat → une Edge Function Supabase (avec la clé `service_role`).
- **Connexion Google / Apple** : prévu par le cahier des charges, non implémenté ici
  (nécessite `expo-auth-session` + configuration des identifiants OAuth).
- **Notifications push** : les rappels d'entretien sont pour l'instant affichés dans
  l'app (badges « en retard » / « bientôt ») mais aucune notification push n'est
  envoyée. Ajouter `expo-notifications` + un job planifié (Supabase Cron / Edge
  Function) qui compare les échéances à la date du jour.
- **Commentaires** : la table `comments` et les policies existent, l'UI n'est pas
  encore branchée (mentionnée dans les notifications sociales du cahier des charges).
- **Icônes et assets** : `assets/icon.png`, `assets/favicon.png`, etc. sont les
  placeholders générés par défaut — à remplacer avant publication.
- **Page publique web** : la route `/vehicle/[id]` fonctionne aussi en web
  (`npm run web` / `expo export -p web`) mais nécessite un déploiement (Vercel,
  Cloudflare Pages, etc.) pour obtenir une vraie URL publique à mettre dans
  `EXPO_PUBLIC_WEB_URL`.

## Notes

- Le modèle Claude utilisé par défaut dans la fonction de recommandations est
  `claude-opus-5`. Pour un cas d'usage aussi léger, `claude-sonnet-5` ou
  `claude-haiku-4-5` réduiraient sensiblement les coûts — à ajuster dans
  `supabase/functions/ai-recommendations/index.ts`.
- Le typage `lib/database.types.ts` est écrit à la main (reflète le schéma SQL). Une
  fois le projet Supabase créé, vous pouvez le régénérer avec
  `npx supabase gen types typescript --project-id <ref> > lib/database.types.ts`.
