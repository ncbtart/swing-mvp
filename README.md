# Swing MVP

Application web interne (MVP) pour le suivi d'activites commerciales, etablissements, chirurgiens, appels d'offres et references produits.

## Stack technique

- Next.js 14 + React 18 + TypeScript
- tRPC (API serveur type-safe)
- Prisma (ORM) + base SQL
- NextAuth (authentification)
- Tailwind CSS

Note: ce projet utilise Prisma, pas Drizzle.

## Lancer le projet en local

### 1) Prerequis

- Node.js 20+
- Yarn 1.x
- Base de donnees accessible via `DATABASE_URL`

### 2) Installation

```bash
yarn install
```

### 3) Configuration

Copier `.env.example` vers un fichier `.env` et renseigner les variables necessaires.

Variables importantes:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 4) Base de donnees

```bash
yarn db:push
yarn db:seed
```

### 5) Demarrage

```bash
yarn dev
```

## Scripts utiles

- `yarn dev`: lance l'app en local
- `yarn build`: build de production
- `yarn start`: demarre le build
- `yarn lint`: controle qualite ESLint
- `yarn test:server`: tests serveur (unitaires/controllers)

## Qualite / tests

- Lint: `yarn lint`
- Tests serveur: `yarn test:server`

Les tests couvrent des utilitaires serveur, la validation de schema et des controllers tRPC (ex: `reference`, `role`).

## Donnees sensibles

- Le dossier `assets/` est ignore par Git.
- Ne jamais versionner les fichiers `.env` ni des secrets locaux.

## Statut

Ce repository est un MVP en evolution, stabilise pour demo technique et revue recruteur.
