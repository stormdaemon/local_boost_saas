# ProspectPilot Local

SaaS commercial en marque blanche pour **freelances web, agences SEO, consultants
marketing et commerciaux terrain** : générez en quelques minutes, pour chaque
prospect local, un audit digital, une stratégie SEO locale, un simulateur de ROI,
un calendrier éditorial, un pitch, une **proposition commerciale chiffrée** et un
**rapport PDF prêt à présenter** — aux couleurs de votre agence.

## Stack

| Couche | Technologie |
| --- | --- |
| Frontend / Backend | Next.js 16 (App Router) · React 19 · Tailwind CSS 4 |
| Base de données | PostgreSQL **Supabase** (toutes les données, via l'ORM) |
| ORM | Prisma 7 (`prisma-client` + `@prisma/adapter-pg`) |
| Authentification & emails | Supabase Auth (inscription, confirmation, réinitialisation) |
| Paiement | PayPal Subscriptions + webhook signé |
| IA | API Gemini (serveur uniquement, bascule automatique entre 7 modèles + repli local) |
| Tests | Vitest (21 tests, TDD sur les modules métier) |
| Déploiement | Netlify (`@netlify/plugin-nextjs`) |

## Démarrage local

```bash
cp .env.example .env       # puis renseigner toutes les valeurs
npm install                # postinstall génère le client Prisma
npx prisma db push         # synchronise le schéma sur la base Supabase
npm run test               # 21 tests Vitest
npm run build
npm run start              # http://localhost:3000
```

> `prisma db push` utilise `DATABASE_URL`. Pour viser le pooler **session**
> (recommandé pour les migrations), lancez :
> `DATABASE_URL=$DIRECT_DATABASE_URL npx prisma db push`.

## Variables d'environnement

Voir [.env.example](.env.example). À configurer **à l'identique sur Netlify**
(Site settings → Environment variables) :

| Variable | Rôle | Exposition |
| --- | --- | --- |
| `GEMINI_API_KEY` | Moteur d'analyse | Serveur uniquement |
| `DATABASE_URL` | PostgreSQL Supabase (pooler 6543) | Serveur uniquement |
| `DIRECT_DATABASE_URL` | Pooler session 5432 (migrations) | Serveur uniquement |
| `PAYPAL_CLIENT_ID` / `PAYPAL_SECRET` | API PayPal | Serveur uniquement |
| `PAYPAL_ENV` | `sandbox` ou `live` | Serveur uniquement |
| `WEBHOOK_CLIENT_ID` | ID du webhook PayPal (vérif. de signature) | Serveur uniquement |
| `WEBHOOK_SECRET` | Secret applicatif interne | Serveur uniquement |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Publique (par conception) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase | Publique (par conception) |
| `SUPABASE_SERVICE_ROLE_KEY` | Opérations d'administration | Serveur uniquement |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site | Publique |

Aucun secret n'est commité ni envoyé au navigateur : le frontend ne reçoit que
des statuts (`planStatus: "active"`, `configured: true`, etc.).

## Déploiement Netlify

1. **Connecter le dépôt** GitHub à Netlify. La configuration est dans
   [netlify.toml](netlify.toml) (build `npm run build`, plugin Next.js officiel).
2. **Renseigner les variables d'environnement** du tableau ci-dessus, avec
   `NEXT_PUBLIC_SITE_URL=https://<votre-domaine>` et `PAYPAL_ENV=live` en
   production.
3. **Supabase** (déjà provisionné) :
   - Authentication → URL Configuration : `Site URL = https://<votre-domaine>`
     et ajouter `https://<votre-domaine>/**` aux Redirect URLs (actuellement
     configuré sur `http://localhost:3000`).
   - Les emails de confirmation / réinitialisation utilisent le service d'envoi
     intégré de Supabase (configurer un SMTP dédié pour du volume).
4. **PayPal** (developer.paypal.com) :
   - Créer une app REST → récupérer `PAYPAL_CLIENT_ID` / `PAYPAL_SECRET`.
   - Créer un **webhook** pointant sur
     `https://<votre-domaine>/api/webhooks/paypal` avec les événements
     `BILLING.SUBSCRIPTION.*` et `PAYMENT.SALE.COMPLETED`.
   - Reporter l'ID du webhook dans `WEBHOOK_CLIENT_ID`.
   - Les produits/plans PayPal (Solo 29 €, Agence 79 €, Pro 149 €) sont créés
     **automatiquement** au premier paiement ; rien à configurer côté catalogue.
5. **Base de données** : le schéma est déjà poussé. Pour toute évolution :
   `npx prisma db push` avec `DIRECT_DATABASE_URL`.

### Vérifications après déploiement

- `GET /api/health` → `{"ok":true,"services":{"data":true,"analysis":true}}`
- Inscription avec un email réel → réception de l'email de confirmation → accès `/app`.
- `/app` sans abonnement → paywall avec les 3 forfaits → paiement PayPal sandbox →
  retour sur `/app/billing/confirmation` → plan actif (le webhook confirme).
- Création d'un prospect → audit généré → rapport → export PDF (bouton Imprimer).
- Connexion admin → `/admin` (statistiques, utilisateurs, paiements, erreurs,
  consommation du moteur d'analyse).

## Compte administrateur temporaire

- **Email** : `tlafont49@gmail.com` · **Mot de passe** : `AdminPass`
- Rôle ADMIN appliqué automatiquement à la connexion (bootstrap par email dans
  `src/lib/auth.ts`). **Changer ce mot de passe immédiatement** via
  `/app/settings`, puis retirer l'email de la liste de bootstrap.

## Sécurité

- Middleware : `/app/**` et `/admin/**` exigent une session ; `/admin` exige le rôle ADMIN.
- Chaque ressource (prospect, analyse, scénario ROI) est **isolée par utilisateur**
  (contrôle de propriété systématique côté serveur).
- Webhook PayPal : signature **vérifiée auprès de PayPal** avant tout traitement ;
  l'activation d'un plan n'est jamais décidée par le navigateur.
- Quotas par forfait (Solo 20 audits/mois, Agence 100, Pro illimité) appliqués
  côté serveur + limitation de débit sur les routes de génération et de contact.
- Entrées validées avec zod ; messages d'erreur publics sans détail interne ;
  erreurs techniques journalisées en base (visibles dans `/admin` uniquement).
- Pages 404/500 dédiées ; `robots.txt` exclut `/app`, `/admin`, `/api`.

## Arborescence fonctionnelle

| Route | Rôle |
| --- | --- |
| `/` · `/tarifs` · `/exemple-rapport` · `/blog/**` · `/contact` · `/legal/**` | Pages publiques SEO |
| `/signup` · `/login` · `/mot-de-passe-oublie` · `/auth/callback` | Authentification |
| `/app` | CRM prospects (pipeline, statuts, montants, relances) |
| `/app/prospects/new` | Création de prospect (4 étapes) |
| `/app/prospects/[id]/**` | Audit, stratégie, ROI, concurrence, calendrier, pitch, proposition, présentation, rapport |
| `/app/billing` (+ `/confirmation`) | Abonnement PayPal |
| `/app/settings` | Marque blanche + changement de mot de passe |
| `/admin` (+ `/admin/models`) | Statistiques, utilisateurs, paiements, erreurs, diagnostic du moteur |

## Tests

```bash
npm run test                              # tests unitaires (plans, quotas, PayPal, libellés, propositions, scores)
node --env-file=.env scripts/smoke-e2e.mjs # parcours authentifié complet contre le serveur local
```
