# Weu — Application Mobile

Application React Native pour les habitants et agents de terrain du quartier Madina (Comores), pensée pour fonctionner en conditions de réseau instable.

## Stack technique

- **React Native** (Expo SDK 54, Expo Router — navigation par fichiers)
- **Supabase** — base de données, authentification
- **AsyncStorage** — persistance de session et cache hors-ligne

## Fonctionnalités

### Habitant

- Pointage de dépôt de déchets en un geste — fonctionne **sans réseau**
- Suivi et paiement de la cotisation mensuelle
- Historique des dépôts et des paiements
- Consultation des finances du quartier (transparence)

### Agent de terrain

- Propositions automatiques de tournées selon le taux de remplissage des points
- Acceptation et suivi des tournées
- Historique des tournées effectuées

## Mode hors-ligne

Point technique central du projet : à Madina, le réseau est instable et beaucoup d'habitants n'ont pas de connexion continue.

- **Persistance de session** — un utilisateur déjà connecté reste connecté sans réseau
- **File d'attente locale** — un pointage effectué hors-ligne est stocké localement, puis synchronisé automatiquement dès que le réseau revient (avec verrou anti-doublon)
- **Cache par page** — chaque écran affiche les dernières données connues en attendant le réseau, au lieu d'un écran de chargement bloqué
- **Indicateur discret** — l'utilisateur voit le nombre d'actions en attente de synchronisation sans que l'app ait l'air "cassée"

## Installation

```bash
npm install
```

## Variables d'environnement

Créer un fichier `.env` à la racine :

EXPO_PUBLIC_SUPABASE_URL=<url_supabase>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<clé_anon_supabase>

## Lancer en développement

```bash
npx expo start
```

## Build (preview / production)

```bash
eas build --profile preview --platform android
```

Nécessite un compte [Expo / EAS](https://expo.dev).

## Structure

app/
├── index.tsx # Connexion (persistance de session, mot de passe oublié)
├── (tabs)/ # Interface habitant
└── (agent)/ # Interface agent de terrain
lib/
├── supabase.ts # Client Supabase configuré pour la persistance de session
├── offlineQueue.ts # File d'attente et synchronisation hors-ligne
└── theme.ts # Design tokens (couleurs, typographie)
styles/
├── tabs/ # Styles interface habitant
└── agent/ # Styles interface agent
