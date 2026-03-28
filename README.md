# Incubateur Élite 4.0

Application Next.js (App Router) : LMS, paiements (Stripe / CinetPay, XOF), rôles STUDENT / COACH / ADMIN.

## Prérequis

- Node.js 20+
- **PostgreSQL** (base unique — plus de SQLite). En local : `docker compose up -d` puis une URL du type  
  `postgresql://postgres:postgres@localhost:5432/incubateur`

## Configuration

```bash
cp .env.example .env
# Renseigner DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL, etc.
```

## Base de données

```bash
npx prisma migrate dev    # développement
npm run db:seed           # données de démo (comptes : voir sortie du seed, ex. password123)
npm run db:reset          # tout réinitialiser + seed
npm run db:empty          # reset sans seed (base vide après migrations)
```

## Développement

```bash
npm install
npm run dev
```

## Déploiement Vercel

Voir **[DEPLOY.md](./DEPLOY.md)** (variables d’environnement, migrations, seed post-déploiement).

Le build exécute `prisma migrate deploy` puis `next build` : la variable **`DATABASE_URL`** doit être définie sur Vercel avant le premier build.
