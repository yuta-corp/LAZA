# Laza — Dénonciation anonyme de corruption à Madagascar

Plateforme web (monolithique) de dénonciation anonyme de corruption, pensée comme un
fil type « Twitter » : des **cartes partageables** (X, LinkedIn, Facebook, WhatsApp,
Instagram) dont la force repose sur la **viralité**, la **facilité d'utilisation**, et la
**vérifiabilité** des informations.

Chaque signalement doit être accompagné de **preuves** et est soumis à une
**pré-modération** par une équipe de confiance avant publication (limite les
dénonciations abusives — Art. 373.1 du Code pénal malgache — et la désinformation).

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript** strict
- **Prisma 7** + **PostgreSQL** (driver adapter `@prisma/adapter-pg`)
- **shadcn/ui** (base-nova, Base UI) + Tailwind CSS v4
- Chiffrement **côté navigateur** (Web Crypto API) : engagement d'identité et empreintes SHA-256

## Démarrage

Prérequis : Node ≥ 20, PostgreSQL local.

```bash
pnpm install

# Configurer la base (voir .env) puis :
createdb laza                          # si besoin
pnpm exec prisma migrate dev           # applique les migrations
pnpm db:seed                           # jeu de données fictif de démonstration

pnpm dev                               # http://localhost:3000
```

### Scripts

| Script            | Description                                        |
| ----------------- | -------------------------------------------------- |
| `pnpm dev`        | Serveur de développement                           |
| `pnpm build`      | Build de production                                |
| `pnpm typecheck`  | Vérification TypeScript (`tsc --noEmit`)           |
| `pnpm lint`       | ESLint                                             |
| `pnpm db:seed`    | Réinitialise et remplit les données de démo        |
| `pnpm exec prisma studio` | Navigation visuelle dans la base           |

## Architecture

```
app/
  page.tsx                     # Fil des signalements publiés (+ hero, « comment ça marche »)
  signaler/page.tsx            # Formulaire de signalement (assistant 4 étapes)
  signalement/[slug]/page.tsx  # Fiche publique d'un signalement (partage réseau)
  api/salt/route.ts            # Salt jetable pour l'engagement d'identité
  api/reports/route.ts         # Création d'un signalement (multipart : champs + fichiers)
components/
  report-card.tsx              # Carte type « tweet » d'un signalement publié
  report-form.tsx              # Assistant : détails → preuves → identité → légal
  share-buttons.tsx            # Partage X / LinkedIn / Facebook / WhatsApp / Instagram / copie
lib/
  generated/prisma/            # Client Prisma généré (ne pas éditer)
  crypto/identity.ts           # Web Crypto : sha256(CIN|naissance|salt), sha256(fichier)
prisma/
  schema.prisma                # Modèle Report / Evidence + énumérations
  seed.ts                      # Données fictives
```

## Sécurité & conformité

- **Anonymat** : seul `sha256(CIN | date de naissance | salt)` est stocké — le numéro CIN
  ne quitte jamais le navigateur. Le sel est généré par le serveur (`/api/salt`).
- **Levée d'anonymat** : uniquement sur **réquisition judiciaire** (schéma cible :
  partage de clés Shamir avec la CMIL et la Justice — voir le document de référence).
- **Intégrité des preuves** : l'empreinte SHA-256 de chaque fichier est calculée dans le
  navigateur **et recalculée côté serveur** ; toute divergence entraîne le rejet.
- **Stockage des preuves** : les fichiers sont téléversés sur **Vercel Blob** (accès public) ;
  seule l'URL publique est conservée en base, et tout visiteur peut consulter la preuve.
- **Avertissement légal** (Art. 373.1, loi 2014-038) affiché sur toutes les pages
  publiques et accepté dans le formulaire avant envoi.
- Obligations documentées : déclaration **CMIL** du traitement, protocoles BIANCO/JJ,
  politique de confidentialité — voir le document de référence fourni.

## Feuille de route

- [ ] Back-office de **modération** (file d'attente, validation/rejet, notes internes)
- [ ] Suivi du statut d'un signalement par référence (page publique)
- [ ] Vérification d'identité ZKP complète (scan CIN, partage de clés Shamir 3 parts)
- [ ] Cartes Open Graph générées dynamiquement par signalement
- [ ] Filtrage du fil par catégorie / région, recherche
- [ ] Anti-spam (rate limiting, preuve de travail) et journal d'audit
- [ ] Transmission assistée au BIANCO des signalements vérifiés

> ⚠️ Les données de démonstration (`pnpm db:seed`) sont **fictives**.
