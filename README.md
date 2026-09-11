# Inscription Canton Fair 2026 — NFDA

Formulaire d'inscription au pack d'accompagnement NFDA (Foire de Canton 2026).
Next.js 16 (App Router) + Server Action + PostgreSQL (Neon), déployé sur Railway.

## Structure

| Fichier | Rôle |
| --- | --- |
| `app/page.tsx` | Landing + en-tête de l'offre |
| `app/inscription-form.tsx` | Formulaire (Client Component, `useActionState`) |
| `app/actions.ts` | Server Action : validation + insertion en base |
| `lib/inscription.ts` | Options du formulaire, schéma Zod, état initial |
| `lib/db.ts` | Client Neon (créé à la première requête) |
| `lib/schema.sql` | Table `inscriptions_canton_2026` |
| `scripts/db-setup.mjs` | Applique `lib/schema.sql` sur la base |

## Développement local

```bash
npm install
cp .env.example .env.local   # puis renseigner DATABASE_URL
npm run db:setup             # crée la table
npm run dev
```

`npm run db:setup` lit `DATABASE_URL` depuis l'environnement. Sous PowerShell :

```powershell
$env:DATABASE_URL = "postgresql://..."
npm run db:setup
```

## Base de données (Neon)

1. Créer un projet sur [neon.tech](https://neon.tech).
2. Copier la **connection string poolée** (`...-pooler....neon.tech`, avec `?sslmode=require`).
3. La définir dans `DATABASE_URL`, puis lancer `npm run db:setup`.

Consulter les inscriptions :

```sql
select created_at, nom, whatsapp, ville_pays, activite, recherche, paiement, decision
from inscriptions_canton_2026
order by created_at desc;
```

## Déploiement Railway

1. Pousser le dépôt sur GitHub, puis « New Project → Deploy from GitHub repo » sur Railway.
2. Railway détecte Next.js : build `npm run build`, start `npm start`. `next start` écoute
   automatiquement sur le `PORT` fourni par Railway.
3. Variables d'environnement à définir dans Railway :

   | Variable | Valeur |
   | --- | --- |
   | `DATABASE_URL` | connection string Neon (poolée) |
   | `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | clé stable, ex. `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

   `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` doit rester identique entre les instances et les
   déploiements, sinon les Server Actions en cours échouent après un redéploiement.
4. Lancer `npm run db:setup` une fois (en local avec la même `DATABASE_URL`, ou via
   `railway run npm run db:setup`).
5. Si le site est servi derrière un domaine personnalisé ou un proxy, ajouter ce domaine à
   `serverActions.allowedOrigins` dans `next.config.ts` (contrôle CSRF de Next.js).

## Notes

- Validation côté serveur avec Zod : toute soumission directe en POST est re-validée.
- Champ honeypot `website` caché pour filtrer les bots basiques.
- « Que recherchez-vous à Canton ? » accepte plusieurs réponses (stockées en `jsonb`).
- Les options « Autre » (recherche et paiement) affichent un champ de précision.
