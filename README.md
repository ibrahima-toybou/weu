#  Weu — Plateforme de gestion de la collecte de déchets

Application complète (mobile + web) développée pour digitaliser la collecte de déchets et les cotisations du quartier **Madina, Comores**. Le projet remplace un suivi papier par une solution temps réel utilisée par les habitants, un agent de terrain et un administrateur.

## Aperçu

|                                |                                                                    |
| ------------------------------ | ------------------------------------------------------------------ |
| 🏠 **ménages**            | Suivi individuel des dépôts et cotisations                         |
| 📍 **Points de collecte**      | État en temps réel, seuils d'alerte, historique de vidage          |
| 📶 **Mode hors-ligne**         | L'app mobile fonctionne sans réseau et synchronise automatiquement |
| 🧾 **Facturation automatique** | Reçu de paiement envoyé par email à chaque cotisation              |
| 🔒 **Sécurisé**                | Row Level Security sur toutes les tables Supabase                  |

## Stack technique

- **Mobile** — React Native (Expo Router), AsyncStorage pour le mode hors-ligne
- **Web Admin** — React.js, CSS Modules
- **Backend** — Supabase (PostgreSQL, Auth, Edge Functions en Deno)
- **Email transactionnel** — Resend

## Structure du repo

weu/
├── mobile/ # App React Native — habitants et agents de terrain
├── admin/ # Interface web — administration du quartier
└── supabase/ # Edge Functions (création de compte, reset password, facturation)

## Fonctionnalités principales

**Interface habitant (mobile)**

- Pointage de dépôt en un geste, fonctionne sans réseau
- Suivi de cotisation et paiement
- Historique personnel

**Interface agent de terrain (mobile)**

- Propositions de tournées calculées selon le remplissage des points
- Validation des vidages

**Interface administrateur (web)**

- Gestion des ménages, cotisations, points de collecte, tournées
- Tableau de bord financier
- Reçus de paiement automatiques par email

## Détails techniques

Voir les README spécifiques :

- [`mobile/README.md`](./mobile/README.md) — architecture de l'app, mode hors-ligne
- [`admin/README.md`](./admin/README.md) — architecture du site admin, sécurité

## Auteur

Ibrahima Toybou — développé dans le cadre d'un projet civic-tech pour le quartier Madina, Comores.
