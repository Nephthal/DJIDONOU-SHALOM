# DJIDONOU SHALOM IMMO — Site web & application

Site de l'agence immobilière **DJIDONOU SHALOM IMMO** (Bénin) : gestion locative, vente de parcelles, accompagnement à l'achat et à la vente de biens immobiliers.

## Contenu

### Partie visiteurs
| Page | Rôle |
|---|---|
| `index.html` | Accueil : recherche, parcelles en vedette, services, carte, locations, étapes d'achat sécurisé, simulateur de paiement échelonné, témoignages, FAQ |
| `biens.html` | Catalogue avec filtres (vente/location, type, ville, prix, surface, chambres, document foncier, paiement échelonné), tri, vues **grille / liste / carte**, favoris, alerte de recherche |
| `bien.html?id=…` | Fiche d'un bien : galerie plein écran, **plan de la parcelle généré automatiquement**, caractéristiques, conditions de location, simulateur, carte, demande de visite, WhatsApp, partage, biens similaires |
| `services.html` | Détail des services et formulaire « Confier mon bien / estimation gratuite » |
| `contact.html` | Coordonnées, formulaire, carte de l'agence |

### Centre de pilotage (administration) — `admin.html`
Identifiants de démonstration : **admin / shalom2026**. Changez-les dès la première connexion dans *Paramètres*.

- **Aujourd'hui** : liste des tâches générée automatiquement (clients à rappeler, visites du jour et du lendemain, loyers à relancer, annonces sans photo) + tâches personnelles, indicateurs animés, semaine en cours, suivi des clients, aperçu des services, activité récente
- **Suivi clients** : tableau en colonnes (Nouveau → Contacté → Visite prévue → Négociation → Conclu / Perdu), glisser-déposer sur ordinateur, menu « Étape » sur mobile, fiche client avec notes internes
- **Agenda** : semaine avec visites, échéances de loyer et tâches ; navigation de semaine en semaine
- **Biens** : cartes avec photo, statut modifiable en un geste, coup de cœur, ajout de photos et position sur la carte
- **Clients** : fiches par type (prospect, acheteur, vendeur, propriétaire, locataire), export CSV
- **Gestion locative** : loyers mois par mois, impayés, relance WhatsApp, commission et reversement
- **Paramètres** : coordonnées de l'agence, mot de passe, sauvegarde et restauration
- Sur mobile : barre d'onglets en bas, bouton « + » flottant, fenêtres qui montent du bas de l'écran

### Application mobile (PWA)
Le site est une *Progressive Web App* : il s'installe sur les téléphones Android et iPhone (« Ajouter à l'écran d'accueil »), avec une icône et un mode hors connexion (`manifest.webmanifest`, `sw.js`). On pourra ensuite le publier sur le Play Store et l'App Store avec **Capacitor** ou **PWABuilder**.

## ⚠️ Important : version de démonstration
Les données (biens, demandes, clients…) sont pour l'instant enregistrées **dans le navigateur de chaque appareil** (`localStorage`). Conséquences :
- un bien ajouté depuis l'administration n'apparaît que sur l'appareil qui l'a ajouté ;
- la protection par mot de passe n'est pas une vraie sécurité.

Pour la mise en ligne réelle, il faut brancher un serveur (par exemple **Supabase** ou **Firebase**) : base de données partagée, vraie connexion sécurisée, stockage des photos. Tout l'accès aux données passe par l'objet `DB` de `assets/js/core.js` pour faciliter ce branchement.

## À personnaliser avant la mise en ligne
- Téléphone, WhatsApp, e-mail, adresse et réseaux sociaux (dans *Paramètres* ou dans `assets/js/data.js`). Réglés : téléphone et WhatsApp +229 01 66 28 45 12, e-mail nathhoue2468@gmail.com, adresse à Kpota (Abomey-Calavi). Réseaux : Facebook et TikTok (pas d'Instagram pour l'instant ; le bouton apparaîtra si un lien est ajouté dans Paramètres).
- Les biens de démonstration et leurs photos (images libres de droits Unsplash), à remplacer par les vraies parcelles
- Les chiffres clés de l'accueil (années d'expérience, etc.) et les témoignages

## Lancer le site en local
```bash
python3 -m http.server 8000
```
Ouvrir ensuite http://localhost:8000

## Mise en ligne gratuite
**GitHub Pages** : *Settings → Pages → Deploy from a branch → `main` / root*. Netlify et Vercel fonctionnent aussi, sans configuration.

## Crédits
Cartes © OpenStreetMap (bibliothèque Leaflet). Photos de démonstration : Unsplash (licence libre).
