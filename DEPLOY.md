# Déploiement Vercel (Incubateur Élite 4.0)

## Prérequis

- Compte [Vercel](https://vercel.com) et dépôt Git (GitHub/GitLab/Bitbucket) poussé avec ce code.
- Une base **PostgreSQL** (recommandé : [Neon](https://neon.tech), [Vercel Postgres](https://vercel.com/storage/postgres), ou Supabase).

## 1. Variables d’environnement

Dans **Vercel → Project → Settings → Environment Variables**, ajouter toutes les clés listées dans `.env.example` :

| Variable | Remarque |
|----------|----------|
| `DATABASE_URL` | Chaîne Postgres (souvent avec `?sslmode=require`). |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Même valeur secrète (ex. `openssl rand -base64 32`). |
| `NEXTAUTH_URL` / `AUTH_URL` / `APP_BASE_URL` | URL HTTPS du déploiement (ex. `https://xxx.vercel.app`). |
| `STRIPE_*` / `CINETPAY_*` | Si paiements activés. |
| `ADMIN_INVITE_CODE` | Optionnel. |

**Important :** sans `DATABASE_URL` correcte, le build échoue à l’étape `prisma migrate deploy`.

**PostgreSQL local (Docker) :** `docker compose up -d` expose la base sur le port **5433** (voir `.env.example`).

## 2. Commande de build

Le projet utilise :

```bash
npm run build
# → prisma migrate deploy && next build
```

Ne pas désactiver `prisma migrate deploy` : elle applique les migrations sur la base Vercel.

En local, validation complète : `npm run ci` (lint, schéma Prisma, migrations sur la base configurée, `next build`). Le dépôt inclut un workflow GitHub Actions équivalent.

## 3. Premier déploiement

1. Connecter le repo à Vercel et importer le projet.
2. Renseigner les variables d’environnement (au minimum `DATABASE_URL`, secrets, URLs).
3. Lancer le déploiement. Les migrations créent les tables vides.

## 4. Données initiales (seed)

Après le premier déploiement réussi, peupler la base **une fois** (comptes de test, cours, etc.) :

```bash
# Avec l’URL de production dans .env.local (DATABASE_URL pointant vers la prod)
npx prisma db seed
```

Ou depuis une machine avec accès à la base :

```bash
DATABASE_URL="postgresql://..." npx prisma db seed
```

Mot de passe des comptes seed : voir la sortie du seed (ex. `password123`).

## 5. Webhooks externes

- **Stripe :** URL du webhook = `https://<domaine>/api/webhooks/stripe`
- **CinetPay :** URL de notification = `https://<domaine>/api/webhooks/cinetpay`

## 6. Vider la base (repartir de zéro)

```bash
npm run db:reset
```

(`migrate reset` réapplique les migrations ; ajouter `--skip-seed` via `npm run db:empty` pour ne pas re-seeder.)

## 6 bis. Variables déjà sur Vercel (sans `.env` dans le bundle)

Le fichier `.vercelignore` exclut `.env` du dépôt uploadé. Les secrets se configurent sur le projet Vercel.

Depuis la racine du dépôt (avec `.env` local et dossier `.vercel/` après `npx vercel link`) :

```bash
npm run vercel:sync-env
```

Puis ajoute **obligatoirement** `DATABASE_URL` (Postgres hébergé, ex. [Neon](https://neon.tech)) — requis au **build** pour `prisma migrate deploy` :

```bash
printf '%s' "postgresql://USER:PASSWORD@HOST/DB?sslmode=require" | npx vercel env add DATABASE_URL production --sensitive --yes
```

## 7. Déploiement en une commande (token)

1. Créer un token : [vercel.com/account/tokens](https://vercel.com/account/tokens) (scope « Full Account » ou équipe du projet).
2. Sur Vercel, créer un projet lié à ce repo **ou** laisser la CLI créer le lien au premier déploiement.
3. Définir les variables d’environnement sur le projet Vercel (dashboard) — le build exécute `prisma migrate deploy`.
4. En local, depuis la racine du dépôt :

```bash
export VERCEL_TOKEN="votre_token"
npm run deploy:vercel
```

Équivalent : `bash scripts/vercel-prod.sh` (le script vérifie que `VERCEL_TOKEN` est défini).

### Connexion interactive (sans token)

```bash
npx vercel login
npx vercel link
npx vercel deploy --prod
```

Les variables doivent être définies sur le projet Vercel (ou via `vercel env pull`).
