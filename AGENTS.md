# Visibl — notes projet

App web **Next.js 16 (App Router) + Tailwind CSS 4 + TypeScript**, à la racine
du dépôt. Lancer avec `npm run dev`.

Tailwind est en v4 : la configuration vit dans `app/globals.css` (`@import
"tailwindcss"` + bloc `@theme`), il n'y a **pas** de `tailwind.config.js`.

Avant de toucher au code : lire `README.md`, en particulier la section
« Architecture » et « Brancher les vraies API ». Les réponses des IA sont
aujourd'hui simulées ; le seul point d'extension est la méthode `ask()` de
chaque fournisseur dans `lib/providers/`.

> L'app mobile Expo « Carnet Garage » vit sur la branche
> `claude/application-utilisant-ca-4zn1z0`, pas ici.
