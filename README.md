# ΦLAMPIA — site e-commerce + app mobile

Monorepo de la marque ΦLAMPIA :

- **`apps/web`** : le site (Next.js 16, Tailwind CSS v4, Stripe Checkout). Il sert aussi de **backend de paiement** à l'app.
- **`apps/mobile`** : l'app iOS / Android (Expo SDK 57, expo-router, Stripe PaymentSheet, Liquid Glass sur iOS 26).
- **`packages/core`** : catalogue, prix, formatage, schémas zod, store panier Zustand (partagés web + mobile).
- **`packages/tokens`** : couleurs, dégradés, rayons, typo (partagés web + mobile).

> Cible actuelle de l'app : **installation sur ton propre iPhone via Xcode avec un Apple ID gratuit** (pas de publication). Voir [Installer l'app sur mon iPhone avec Xcode](#installer-lapp-sur-mon-iphone-avec-xcode).

## Sommaire

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Lancer le site](#lancer-le-site)
4. [Installer l'app sur mon iPhone avec Xcode](#installer-lapp-sur-mon-iphone-avec-xcode)
5. [Options secondaires : Expo Go et Expo web](#options-secondaires--expo-go-et-expo-web)
6. [Variables d'environnement](#variables-denvironnement)
7. [Tester l'app contre le site en local](#tester-lapp-contre-le-site-en-local)
8. [Tester le paiement](#tester-le-paiement)
9. [Changer les prix et les photos](#changer-les-prix-et-les-photos)
10. [Déployer le site sur Vercel](#déployer-le-site-sur-vercel)
11. [Publication future (EAS) et fonctions à réactiver](#publication-future-eas-et-fonctions-à-réactiver)
12. [Structure et commandes](#structure-et-commandes)
13. [Reste à fournir par le client](#reste-à-fournir-par-le-client)

---

## Prérequis

- **Node.js 22.18 ou plus récent** (24 LTS recommandé) : https://nodejs.org
- Pour l'iPhone : **Xcode 26 ou plus récent** (App Store), un **Apple ID** (gratuit suffit), un câble USB.
- **CocoaPods** (dépendances iOS) : `sudo gem install cocoapods`, ou laisse Expo proposer de l'installer au premier build.

## Installation

À la racine du projet :

```bash
npm install
```

Le `postinstall` copie les images de `public/assets/` vers les deux apps (`scripts/sync-assets.mjs`). Ensuite, crée les fichiers d'environnement à partir des exemples :

```bash
cp apps/web/.env.example apps/web/.env.local
```

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

## Lancer le site

```bash
npm run dev:web
```

Le site est sur http://localhost:3000. Turborepo génère d'abord le thème CSS à partir de `packages/tokens`.

---

## Installer l'app sur mon iPhone avec Xcode

### Ce qui change avec un Apple ID gratuit

Une équipe gratuite (« Personal Team ») ne peut pas signer certaines fonctions. Elles sont donc **désactivées par défaut** et réactivables avec un compte payant (voir [la liste](#fonctions-à-réactiver-avec-un-compte-apple-developer-payant)) :

| Fonction | État actuel | Remplacement |
| --- | --- | --- |
| Notifications push | désactivées (`EXPO_PUBLIC_PUSH_ENABLED=false`, aucun entitlement `aps-environment`) | Le Club propose l'**inscription par e-mail** |
| Apple Pay | désactivé (pas de merchant id) | Paiement par **carte** dans la PaymentSheet |
| Liens universels (Associated Domains) | retirés | Le lien `phlampia://produit/…` fonctionne toujours |

L'identifiant de l'app est `com.cameronpaoletti.phlampia` (unique, adapté à une équipe gratuite).

### Pas à pas

**0. Préparer l'environnement de l'app** dans `apps/mobile/.env` :

```
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000   ← l'IP de ton Mac (voir plus bas)
EXPO_PUBLIC_APP_KEY=…                           ← la même valeur que APP_API_KEY du site
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
EXPO_PUBLIC_PUSH_ENABLED=false
```

Trouver l'IP du Mac : Réglages Système › Wi-Fi › Détails… › Adresse IP (ou `ipconfig getifaddr en0` dans le Terminal).

**1. Ajouter ton Apple ID dans Xcode** : Xcode › Settings… › Accounts › « + » › Apple ID. Une « Personal Team » apparaît.

**2. Préparer l'iPhone** :
- Branche-le en USB et réponds **« Se fier à cet ordinateur »** sur l'iPhone.
- Active **Réglages › Confidentialité et sécurité › Mode développeur** (l'option n'apparaît qu'après avoir branché l'iPhone au Mac avec Xcode ouvert), puis **redémarre** l'iPhone et confirme l'activation.

**3. Compiler et installer** (le site doit tourner : `npm run dev:web`) :

```bash
npm run ios:device
```

Cette commande génère le dossier natif `apps/mobile/ios/` (`expo prebuild`, ignoré par git), compile en **Debug** et installe l'app ; Metro tourne sur le Mac et l'iPhone doit être sur le **même Wi-Fi**.

Si la signature échoue, ouvre `apps/mobile/ios/*.xcworkspace` dans Xcode, sélectionne la cible **ΦLAMPIA** › **Signing & Capabilities** › Team = ta **Personal Team**, choisis ton iPhone en haut de la fenêtre, puis ▶︎. Astuce : renseigne `APPLE_TEAM_ID` dans `apps/mobile/.env` (Team ID visible dans Xcode › Settings › Accounts) pour ne plus avoir à la resélectionner.

**4. Premier lancement** : sur l'iPhone, **Réglages › Général › VPN et gestion de l'appareil** › ton profil développeur › **Faire confiance**.

**5. Version autonome (sans le Mac)** : crée `apps/mobile/.env.production` avec `EXPO_PUBLIC_API_URL=https://<ton-site>.vercel.app` (site déployé en HTTPS, sinon le panier et le paiement ne marchent pas hors de la maison), puis :

```bash
npm run ios:release
```

Le JavaScript est embarqué dans l'app (build **Release**) : elle fonctionne sans Metro ni Wi-Fi local.

> **Rappels Apple ID gratuit** : l'app **expire au bout de 7 jours** ; il suffit de relancer `npm run ios:device` (ou `ios:release`) pour la réinstaller. **3 apps maximum** installées de cette façon par appareil.

> **Liquid Glass** : le vrai verre natif (`expo-glass-effect`) nécessite Xcode 26+ et un iPhone sous iOS 26+. Sur une version plus ancienne, l'app choisit automatiquement le repli `BlurView`.

### Erreurs fréquentes

| Problème | Solution |
| --- | --- |
| « Signing for "ΦLAMPIA" requires a development team » | Xcode › Signing & Capabilities › Team = ta Personal Team (ou `APPLE_TEAM_ID` dans `.env`). |
| « Failed to register bundle identifier » / identifiant déjà pris | Change `bundleIdentifier` dans `apps/mobile/app.config.ts` (ex. `com.tonnom.phlampia2`), puis relance `npm run ios:device`. |
| « Provisioning profile doesn't support the Push Notifications capability » | Vérifie `EXPO_PUBLIC_PUSH_ENABLED=false`, puis relance (le prebuild retire l'entitlement). |
| L'iPhone n'apparaît pas dans Xcode | Câble data (pas seulement charge), « Se fier à cet ordinateur », Mode développeur activé + redémarrage, iPhone déverrouillé. |
| « Untrusted Developer » au lancement | Étape 4 : faire confiance au profil dans VPN et gestion de l'appareil. |
| L'app reste sur un écran blanc / « Could not connect to development server » | Mac et iPhone sur le même Wi-Fi ; Metro lancé ; pare-feu macOS qui autorise Node ; autorise l'accès au **réseau local** quand iOS le demande. |
| Le panier ou le paiement affiche « Connexion impossible » | `EXPO_PUBLIC_API_URL` doit être l'IP du Mac (pas `localhost`) et le site doit tourner (`npm run dev:web`). |
| L'app a disparu ou ne s'ouvre plus après une semaine | Expiration des 7 jours : relance le build. |

---

## Options secondaires : Expo Go et Expo web

**Expo Go** (itérer vite sur le design, sans Xcode) :

```bash
npm run dev:mobile
```

Scanne le QR code avec l'appareil photo de l'iPhone (app Expo Go installée). Limites : pas d'Apple Pay ni de Google Pay, notifications push indisponibles sur Android.

**Expo web** (démos client dans le navigateur du Mac) :

```bash
npm run dev:mobile:web
```

Les fichiers `.web.tsx` / `.web.ts` remplacent le natif : paiement par **redirection Stripe Checkout**, verre en `backdrop-filter` CSS, haptique, capteurs et push sans effet, app affichée dans une colonne de 430 px. Côté site, ajoute l'origine d'Expo web à `APP_WEB_ORIGINS` (par défaut `http://localhost:8081`).

---

## Variables d'environnement

### Site — `apps/web/.env.local` (et Vercel)

| Variable | Rôle |
| --- | --- |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_test_…` tant que le client n'a pas validé). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publiable, renvoyée à l'app avec la PaymentSheet. |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du webhook `/api/stripe/webhook`. |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (retours Stripe, sitemap, Open Graph). |
| `APP_API_KEY` | Clé partagée avec l'app (header `x-app-key`). Chaîne longue et aléatoire : `openssl rand -hex 32`. |
| `APP_WEB_ORIGINS` | Origines autorisées pour Expo web (CORS), ex. `http://localhost:8081`. Vide si inutile. |

### App — `apps/mobile/.env` (Debug) et `apps/mobile/.env.production` (Release)

| Variable | Rôle |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL du site : IP du Mac en Debug, URL Vercel (HTTPS) en Release. |
| `EXPO_PUBLIC_APP_KEY` | Identique à `APP_API_KEY` du site. |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publiable Stripe (test). |
| `EXPO_PUBLIC_PUSH_ENABLED` | `false` avec un Apple ID gratuit. |
| `APPLE_TEAM_ID` | Facultatif : Team ID de la Personal Team. |
| `APPLE_MERCHANT_ID`, `APP_DOMAIN`, `EAS_PROJECT_ID` | Réservés à un compte payant (Apple Pay, liens universels, push). Laisser vides. |

Sécurité : la clé `x-app-key` est embarquée dans l'app, elle filtre les appels mais n'est pas un secret fort. Les vraies protections sont côté serveur : **les montants sont toujours recalculés depuis le catalogue** et le paiement est confirmé par Stripe. Une exception ATS « réseau local » n'est ajoutée que lorsque `EXPO_PUBLIC_API_URL` est en `http://` (Debug).

## Tester l'app contre le site en local

1. Lance le site : `npm run dev:web` (il écoute sur le réseau local).
2. Dans `apps/mobile/.env` : `EXPO_PUBLIC_API_URL=http://<IP-du-Mac>:3000` et `EXPO_PUBLIC_APP_KEY` = `APP_API_KEY` du site.
3. Lance l'app (`npm run ios:device` ou `npm run dev:mobile`). Après une modification de `.env`, relance Metro.

## Tester le paiement

Stripe **en mode test uniquement** tant que le client n'a pas validé.

1. Clés de test du Dashboard Stripe dans `apps/web/.env.local` et `apps/mobile/.env`.
2. **Site** : ajouter au panier › « Passer commande » › page Stripe Checkout.
   **App** : Panier › « Payer » › adresse de livraison › PaymentSheet.
3. Carte de test : **4242 4242 4242 4242**, date future, CVC quelconque. Autres cartes : `4000 0025 0000 3155` (3-D Secure), `4000 0000 0000 9995` (refus).
4. Webhook en local (facultatif) : `stripe listen --forward-to localhost:3000/api/stripe/webhook` (CLI Stripe), puis copie le `whsec_…` affiché dans `STRIPE_WEBHOOK_SECRET`.

## Changer les prix et les photos

**Prix** : `packages/core/src/products.ts`, champ `priceCents` **en centimes TTC** (`4500` = 45,00 €). Un seul endroit pour le site, l'app et les deux API de paiement. Tant que le prix vaut `0` : « Prix bientôt disponible », achat désactivé, API en 400, pas d'offre dans le JSON-LD. Même fichier : `composition`, `entretien`, `embroidery`, `completeTheLook`.

**Photos** : remplace les fichiers dans **`public/assets/`** (à la racine) en gardant les mêmes noms, puis `npm run assets:sync` (lancé aussi à chaque `npm install`). Pour une nouvelle photo, ajoute-la dans `public/assets/`, déclare-la dans `packages/core/src/assets.ts` et utilise sa clé dans `products.ts`. Une image manquante s'affiche en placeholder gris étiqueté, sans casser le build. Si le logo change : `npm run icons:generate` régénère l'icône et le splash de l'app.

## Déployer le site sur Vercel

1. Pousse le monorepo sur GitHub.
2. Vercel › Add New › Project › importe le dépôt, **Root Directory : `apps/web`** (Vercel installe les dépendances à la racine du monorepo).
3. Build Command : `cd ../.. && npx turbo run build --filter=@phlampia/web`.
4. Variables d'environnement : celles du tableau « Site » (clés Stripe **test** pour l'instant).
5. Stripe › Webhooks : ajoute `https://<domaine>/api/stripe/webhook` (événements `checkout.session.completed` et `payment_intent.succeeded`), copie le secret dans `STRIPE_WEBHOOK_SECRET`.
6. Mets l'URL Vercel dans `apps/mobile/.env.production`, puis `npm run ios:release`.

## Publication future (EAS) et fonctions à réactiver

Pour publier sur l'App Store et Google Play : comptes **Apple Developer** (payant) et **Google Play Console**, puis EAS (`npm i -g eas-cli`, `eas login`, `eas init`). `apps/mobile/eas.json` contient les profils `development`, `preview` et `production`.

```bash
cd apps/mobile && eas build --profile production --platform all
```

```bash
cd apps/mobile && eas submit --profile production --platform all
```

### Fonctions à réactiver avec un compte Apple Developer payant

1. **Bundle id définitif** validé avec le client : `apps/mobile/app.config.ts` et `apps/web/src/lib/app-links.ts`.
2. **Notifications push** : `EXPO_PUBLIC_PUSH_ENABLED=true` + `EAS_PROJECT_ID` (via `eas init`) ; le plugin `expo-notifications` et l'entitlement `aps-environment` reviennent automatiquement. Stocker les jetons (`/api/push-token`, TODO Supabase/Upstash).
3. **Apple Pay** : créer un merchant id (developer.apple.com) et le certificat Apple Pay dans Stripe, puis `APPLE_MERCHANT_ID=merchant.…`.
4. **Google Pay** : déjà prévu dans la PaymentSheet (Android) ; passer `testEnv` à `false` en production.
5. **Liens universels** : `APP_DOMAIN=www.…` (Associated Domains + App Links Android), et remplir `APPLE_TEAM_ID` et l'empreinte SHA-256 dans `apps/web/src/lib/app-links.ts` (servis par `/.well-known/…`).
6. **URLs des stores** dans `apps/web/src/lib/site.ts` (bannière « Télécharge l'app »).
7. **Stripe en mode live** après validation du client.

## Structure et commandes

```
apps/web/        site + API (checkout, payment-sheet, push-token, club-subscribe, app-checkout, webhook, .well-known)
apps/mobile/     app Expo (src/app = écrans expo-router, src/components, src/lib ; *.web.tsx = replis Expo web)
packages/core/   catalogue, prix, schémas zod, store panier, calcul serveur des montants
packages/tokens/ identité visuelle (TS) → génère le theme.css du site
public/assets/   photos sources
scripts/         sync-assets.mjs, generate-app-icons.mjs
```

| Commande (racine) | Rôle |
| --- | --- |
| `npm run dev:web` | Site en développement |
| `npm run ios:device` | App sur l'iPhone, build Debug (Metro sur le Mac) |
| `npm run ios:release` | App sur l'iPhone, build Release (autonome) |
| `npm run dev:mobile` | Expo Go |
| `npm run dev:mobile:web` | Expo web |
| `npm run assets:sync` | Copie des photos vers les apps |
| `npm run build` / `lint` / `typecheck` | Vérifications de tout le monorepo (Turborepo) |

Qualité vérifiée : site sans scroll horizontal à 390, 768, 1280 et 1440 px, contrastes AA (texte secondaire `#454A52` à 5,04:1 sur l'argent le plus foncé), app testée sur simulateur iPhone SE (iOS 26.5).

## Reste à fournir par le client

### Dans le code (`TODO`)

| Où | Quoi |
| --- | --- |
| `packages/core/src/products.ts` | **Composition** et **entretien** des 5 produits (`null`). Prix renseignés : T-shirt 25,99 €, Polo 40,99 €, Sweat 55,99 €, Jogging 70,99 €, Short 35,99 € |
| `apps/web/src/actions/subscribe.ts`, `apps/web/src/app/api/club-subscribe/route.ts` | Brancher l'outil d'e-mailing du Club (Brevo, Mailchimp) |
| `apps/web/src/lib/checkout-session.ts` | **Frais de livraison** (`shipping_options` Stripe) |
| `apps/web/src/app/api/stripe/webhook/route.ts` | Envoyer l'e-mail / enregistrer la commande |
| `apps/web/src/app/api/push-token/route.ts` | Stocker les jetons push (Supabase / Upstash) |
| `apps/web/src/lib/site.ts` | URLs App Store / Google Play |
| `apps/web/src/lib/app-links.ts` | Team ID Apple, empreinte SHA-256 Android, bundle id définitif |
| `apps/mobile/app.config.ts` | Bundle id définitif, merchant id Apple Pay, domaine, ID projet EAS (compte payant) |
| `apps/mobile/src/lib/config.ts` | E-mail de contact du service client |
| `apps/mobile/eas.json` | ID App Store Connect (`ascAppId`), IP du Mac pour le profil `development` |
| `apps/web/src/app/compte/page.tsx` | Espace client (si souhaité) |

### Pages légales (`[À COMPLÉTER]`, à faire valider par un juriste)

- **Mentions légales** : dénomination sociale, forme juridique et capital, siège, RCS et SIREN, TVA intracommunautaire, téléphone, e-mail, directeur ou directrice de la publication, adresse de l'hébergeur, crédits photo.
- **CGV** : identité du vendeur, service client, grille et délais de livraison, droits de douane Suisse, adresses de rétractation et de retour, frais de retour, encadré légal sur la garantie de conformité, médiateur de la consommation, date de mise à jour.
- **Confidentialité** : responsable du traitement, durées de conservation, outil d'e-mailing, transporteur, prestataire de stockage des jetons push, transferts hors UE, contact pour l'exercice des droits, date de mise à jour.
- **Livraison & retours** : délais et tarifs par pays, douane Suisse, transporteur et suivi, procédure et adresse de retour, frais de retour, échanges, contact pour les articles défectueux.
