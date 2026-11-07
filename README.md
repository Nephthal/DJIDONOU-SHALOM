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

### Partie administrateur — `admin.html`
Identifiants de démonstration : **admin / shalom2026**. Changez-les dès la première connexion dans *Paramètres*.

- **Tableau de bord** : biens disponibles, nouvelles demandes, loyers encaissés, impayés, graphiques
- **Biens & annonces** : ajouter, modifier ou supprimer un bien, gérer les photos (import depuis le téléphone ou lien web), placer le bien sur la carte, changer le statut (disponible, réservé, vendu, loué), mettre en avant
- **Demandes** : toutes les demandes envoyées depuis le site (visites, informations, alertes, biens confiés), avec suivi du statut, réponse WhatsApp en un clic, ajout aux clients et planification de visite
- **Clients** : fichier clients (prospects, acheteurs, vendeurs, propriétaires, locataires), export CSV
- **Gestion locative** : contrats, suivi des loyers mois par mois, impayés, relance WhatsApp, commission de l'agence et montant à reverser au propriétaire
- **Visites** : agenda des visites, confirmation par WhatsApp
- **Paramètres** : informations de l'agence (téléphone, WhatsApp, e-mail, adresse, réseaux sociaux), mot de passe, sauvegarde et restauration des données

### Application mobile (PWA)
Le site est une *Progressive Web App* : il s'installe sur les téléphones Android et iPhone (« Ajouter à l'écran d'accueil »), avec une icône et un mode hors connexion (`manifest.webmanifest`, `sw.js`). On pourra ensuite le publier sur le Play Store et l'App Store avec **Capacitor** ou **PWABuilder**.

## ⚠️ Important : version de démonstration
Les données (biens, demandes, clients…) sont pour l'instant enregistrées **dans le navigateur de chaque appareil** (`localStorage`). Conséquences :
- un bien ajouté depuis l'administration n'apparaît que sur l'appareil qui l'a ajouté ;
- la protection par mot de passe n'est pas une vraie sécurité.

Pour la mise en ligne réelle, il faut brancher un serveur (par exemple **Supabase** ou **Firebase**) : base de données partagée, vraie connexion sécurisée, stockage des photos. Tout l'accès aux données passe par l'objet `DB` de `assets/js/core.js` pour faciliter ce branchement.

## À personnaliser avant la mise en ligne
- Téléphone, WhatsApp, e-mail, adresse et réseaux sociaux (dans *Paramètres* ou dans `assets/js/data.js`). Le téléphone et le WhatsApp sont réglés sur le +229 01 66 28 45 12 ; l'e-mail et l'adresse sont encore à confirmer.
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
