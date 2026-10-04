Tu vas construire la boutique e-commerce de la marque de vêtements **ΦLAMPIA**. Le site doit être prêt pour la production, déployable sur Vercel, et vendre avec Stripe. Lis toute cette consigne avant d'écrire du code. Commence par me présenter un plan court (arborescence et étapes), puis construis tout sans t'arrêter. À la fin, lance `npm run build` et `npm run lint`, et corrige jusqu'à ce que les deux passent.

## 1. Stack (imposée)
- Dernière version stable de **Next.js** (App Router, TypeScript strict, `src/`), **Tailwind CSS v4**, `next/font` pour les polices, `next/image` pour toutes les images.
- Panier : **Zustand** avec `persist` (localStorage). Pas de base de données.
- Paiement : **Stripe Checkout** (Checkout Session créée côté serveur dans une route `app/api/checkout/route.ts`, avec `price_data` en ligne pour ne rien avoir à créer à la main dans Stripe).
- Validation : **zod** sur le body du checkout. Les prix sont TOUJOURS relus côté serveur dans le catalogue, jamais ceux envoyés par le client.
- Aucun autre framework UI. Icônes en SVG inline au trait (stroke 1.8), pas d'emoji.

## 2. Assets (déjà fournis dans `public/assets/`)
- `logo-gold.png` : emblème (visage grec), fond transparent, finition or
- `tshirt-noir.jpg`, `tshirt-dos-short.jpg`, `polo-blanc.jpg`, `sweat-jogging.jpg`, `sweat-profil.jpg` : photos mannequins portrait, fond studio gris clair
- `showroom.jpg` : rendu 3D du showroom, paysage
Si un fichier manque, mets un placeholder gris étiqueté au lieu de planter le build.

## 3. Identité visuelle (stricte, à mettre en tokens dans `globals.css` via `@theme`)
- **Fond** : dégradé argent fixe sur le body, de haut en bas : `#F6F7F9 0%`, `#E3E5E9 34%`, `#CDD0D6 70%`, `#BFC3CA 100%`, `background-attachment: fixed`.
- **Encre** `#121316`, **texte secondaire** `#454A52` (contraste ≥ 4.5:1 sur l'argent, à vérifier).
- **Or** (réservé à l'emblème, à la carte Club et au bouton Club, nulle part ailleurs) : `linear-gradient(125deg,#6B4815 0%,#C79D4D 19%,#F8E6AB 37%,#B7893A 55%,#ECD08A 73%,#7A5520 100%)`. Accent texte or sur fond noir : `#E3C275`.
- **Polices** : `Cinzel` (600/700, letter-spacing .06em) uniquement pour le nom ΦLAMPIA. `Archivo` (variable, axe wdth) pour tout le reste. Titres : `font-stretch: 66%`, graisse 850, majuscules, line-height .9.
- **Nom ΦLAMPIA = argent chrome dans une capsule de verre liquide**. Crée deux utilitaires :
  - `.chrome` : `background: linear-gradient(180deg,#fff 0%,#F1F2F5 18%,#A9AFB8 44%,#fff 53%,#D3D6DB 68%,#7B818B 100%); background-clip: text; color: transparent; filter: drop-shadow(0 1px 0 rgba(255,255,255,.75)) drop-shadow(0 3px 10px rgba(18,19,22,.38));`
  - `.glass` : `background: linear-gradient(135deg,rgba(255,255,255,.44),rgba(255,255,255,.10)); backdrop-filter: blur(22px) saturate(170%); border: 1px solid rgba(255,255,255,.62); box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -1px 1px rgba(255,255,255,.3), inset 0 0 30px rgba(255,255,255,.22), 0 24px 60px rgba(18,19,22,.16);` plus un reflet `::before` en `radial-gradient(120% 70% at 28% 0%, rgba(255,255,255,.7), transparent 58%)`.
  - Règle : la capsule de verre est toujours posée sur une photo, jamais sur un aplat argent (sinon elle est invisible).
  - Dans le header, le nom utilise une variante `.chrome-dark` (`#8F959E → #2F333A → #B9BEC6 → #24272C`) pour rester lisible sur le verre clair.
- Boutons en pilule de 54 px de haut : primaire noir plein, secondaire en verre. Rayons : cartes 20 px, sections 30 px.
- Style de référence : structure aérée et éditoriale façon **Stüssy**, mécanique produit façon **Nike** (grands titres condensés, tuiles catégories, fiche produit avec colonne d'achat sticky, panier en tiroir). Pas de méga-menu : il n'y a que 5 produits.

## 4. Catalogue (`src/data/products.ts`, typé)
| slug | nom | catégorie | détail | coloris | images |
|---|---|---|---|---|---|
| tshirt-oversize | T-shirt Oversize | tshirts | Brodé devant & dos | Noir | tshirt-noir, tshirt-dos-short |
| polo-pique | Polo Piqué | polos | Broderie poitrine | Blanc | polo-blanc, showroom |
| sweat-col-rond | Sweat Col Rond | sweats | Brodé devant & manche | Noir | sweat-jogging, sweat-profil |
| jogging | Jogging | joggings | Assorti au sweat | Noir | sweat-profil, sweat-jogging |
| short | Short | shorts | Assorti au T-shirt | Noir | tshirt-dos-short, tshirt-noir |

- Tailles : XS, S, M, L, XL, XXL.
- `priceCents: 0` partout avec un commentaire `// TODO prix client`. Si le prix est 0, l'interface affiche « Prix bientôt disponible », le bouton d'achat est désactivé et l'API checkout renvoie 400. N'invente aucun prix.
- Champs `composition` et `entretien` en `null` : afficher « Information à venir ».
- Formatage des prix avec `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })`.

## 5. Pages et composants
- **Layout** : bandeau marquee noir (« Nouvelle collection — disponible maintenant · Broderie devant & dos · Porte ce qui te ressemble », séparateurs Φ en `#E3C275`, animation CSS, arrêt si `prefers-reduced-motion`). Header sticky en verre : nav à gauche (Nouveautés, T-shirts, Sweats, Lookbook, Club), emblème or + nom chrome au centre, recherche / compte / panier avec compteur à droite. Menu burger en plein écran sous 900 px.
- **`/` Accueil** :
  1. Hero de 700 px, arrondi 30 px : deux photos côte à côte (tshirt-noir | sweat-jogging), capsule de verre centrée avec ΦLAMPIA en chrome (`clamp(54px, 9vw, 138px)`), tagline « Porte ce qui te ressemble. », CTA « Découvrir la collection » → `/collection` et « Lookbook » → `#lookbook`. Apparition en fondu/montée décalée.
  2. « Shop par pièce » : 3 tuiles 3:4 (T-shirts, Polos, Sweats) avec barre de légende en verre et zoom au survol, liens vers `/collection?cat=…`.
  3. « Nouveautés » : les 5 produits.
  4. Lookbook (`id="lookbook"`) : showroom en pleine largeur, carte de texte en verre, « Shopper le look ».
  5. Club (`id="club"`) : panneau noir, **carte membre or** inclinée à -5° (ratio carte bancaire, emblème, puce, « MEMBRE GOLD », « ΦLAMPIA », « CLUB », reflet lumineux qui balaie au survol, redressement au survol). Formulaire e-mail validé par zod via une Server Action `subscribe` qui pour l'instant fait juste un `console.log` avec un `// TODO brancher Brevo/Mailchimp` ; afficher l'état de succès et l'état d'erreur.
- **`/collection`** : chips de filtre (Tout, T-shirts, Polos, Sweats, Joggings, Shorts) synchronisées avec `?cat=`, grille `repeat(auto-fill, minmax(260px, 1fr))`, cartes 4:5 avec seconde image en fondu au survol et badge verre « Nouveau ».
- **`/produit/[slug]`** (`generateStaticParams`, `generateMetadata`, 404 propre) : fil d'Ariane, miniatures verticales + image principale 4:5, nom en titre condensé, détail, prix, pastille de coloris, grille de tailles 3 colonnes (sélection = fond noir), « Ajouter au panier » qui affiche une erreur inline tant qu'aucune taille n'est choisie, puis ouvre le tiroir panier. Accordéons accessibles : Broderie, Matière & entretien, Livraison & retours. Rangée « Complète le look ». La colonne d'achat est sticky sur desktop et s'empile sur mobile.
- **Tiroir panier** (verre, glisse depuis la droite, focus piégé, fermeture avec Échap et clic hors du tiroir) : lignes avec image, taille, quantité −/+, supprimer, sous-total, « Passer commande » → POST `/api/checkout` → redirection vers Stripe. État vide avec lien vers la collection.
- **`/merci`** : lit `session_id`, récupère la session Stripe côté serveur, affiche le récapitulatif et vide le panier.
- **Pages légales obligatoires en France** (contenu placeholder clairement marqué `[À COMPLÉTER]`) : `/mentions-legales`, `/cgv` (avec droit de rétractation de 14 jours), `/confidentialite`, `/livraison-retours`. Liens dans le footer.
- **Footer** : colonnes Boutique / Aide / Marque, emblème + nom, © année courante ΦLAMPIA.

## 6. Checkout Stripe
- Variables dans `.env.local` (crée un `.env.example`) : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`.
- Session en `mode: 'payment'`, devise EUR, `shipping_address_collection` pour FR, BE, CH, LU, `phone_number_collection`, `metadata` avec slug et taille par ligne, `success_url` = `/merci?session_id={CHECKOUT_SESSION_ID}`, `cancel_url` = `/collection`.
- Quantité limitée de 1 à 10 par ligne, côté serveur.

## 7. Qualité (non négociable)
- Responsive testé à 390, 768, 1280 et 1440 px. Aucun scroll horizontal.
- Accessibilité : vrais `<button>` et `<a>`, `aria-label` sur les boutons-icônes, `alt` descriptif sur chaque photo, focus visible, cibles tactiles ≥ 44 px, contraste AA.
- Performance : `next/image` avec `sizes`, `priority` seulement sur le hero, polices en `display: swap`, pas de librairie d'animation (CSS uniquement).
- SEO : metadata par page, Open Graph avec showroom.jpg, `sitemap.ts`, `robots.ts`, JSON-LD `Product` sur chaque fiche (sans prix tant que `priceCents` vaut 0).
- Aucun lorem ipsum, aucun chiffre ou avis inventé.

## 8. Livrables
- Le code complet, un `README.md` en français avec : installation, variables d'environnement, comment changer les prix et les photos, test du paiement avec la carte Stripe `4242 4242 4242 4242`, déploiement Vercel.
- La liste de tous les `TODO` et `[À COMPLÉTER]` restants, pour que je sache quoi demander au client.
