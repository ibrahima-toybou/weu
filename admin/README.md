# Weu — Interface Admin

Tableau de bord web de la plateforme **Weu**, permettant à l'administrateur du quartier Madina de piloter la collecte de déchets et le suivi des cotisations en temps réel.

## Stack technique

- **React.js** (Create React App)
- **Supabase** — PostgreSQL, authentification, Edge Functions
- **CSS Modules** — styles scopés par composant
- **Resend** — envoi d'emails transactionnels

## Fonctionnalités

- **Tableau de bord** — indicateurs clés (ménages actifs, cotisations du mois, points urgents, solde)
- **Gestion des ménages** — création avec invitation par email, suspension, archivage, changement de point de collecte, fiche détaillée avec historique d'activité
- **Gestion des cotisations** — enregistrement des paiements cash, historique, envoi automatique d'un reçu de paiement par email avec code de vérification anti-fraude
- **Gestion des points de collecte** — état de remplissage en temps réel, seuils d'alerte, validation de vidage, historique
- **Gestion des tournées** — planification et suivi
- **Finances** — vue consolidée cotisations / dépenses / solde
- **Authentification** — accès réservé au rôle `super_admin`

## Sécurité

Row Level Security (RLS) activé sur l'ensemble des tables Supabase. Chaque rôle (`habitant`, `agent_terrain`, `super_admin`) n'a accès qu'aux données que ses permissions autorisent, y compris en accès direct à l'API — pas seulement via l'interface.

## Installation

```bash
npm install
```

## Variables d'environnement

Créer un fichier `.env` à la racine :
REACT_APP_SUPABASE_URL=<url_supabase>
REACT_APP_SUPABASE_ANON_KEY=<clé_anon_supabase>

## Lancer en développement

```bash
npm start
```

Disponible sur [http://localhost:3000](http://localhost:3000).

## Build de production

```bash
npm run build
```

Génère un dossier `build/` prêt à déployer (Vercel).

## Structure

src/
├── pages/ # Dashboard, Menages, Cotisations, Points, Tournees, Finances, Login
├── components/ # Layout (navigation), Select (composant de formulaire)
└── supabase.js # Client Supabase

## Edge Functions liées

- `creer-menage` — inscription d'un ménage + envoi de l'invitation
- `reset-password` — réinitialisation de mot de passe
- `envoyer-facture` — génération et envoi du reçu de cotisation
