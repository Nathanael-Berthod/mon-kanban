# KanbanRT

Application web de gestion de tâches en **Kanban** (tableau à colonnes) avec authentification, base de données temps réel et déploiement en ligne.

Projet réalisé dans le cadre du **BUT Réseaux & Télécommunications — Semestre 2**, module **R2.09 Initiation au développement Web** (IUT de Roanne, Université Jean Monnet).

## Équipe

- **Mathéo Luciani** — authentification, sécurité & déploiement
- **Maxime Doudnikoff** — base de données & tableau Kanban
- **Nathanaël Berthod** — création de tâches & fonctionnalité libre

## Démo en ligne

➡️ **Application déployée :** https://mon-kanban-nathanael-berthods-projects.vercel.app

## Stack technique

| Domaine | Technologie |
|---|---|
| Front-end | React 19, Vite, React Router 7 |
| Back-end / BDD | Supabase (Auth JWT, PostgreSQL, Storage, Realtime) |
| Drag & drop | @dnd-kit |
| E-mails | Resend (fonction serverless Vercel) |
| Hébergement | Vercel (CI/CD via GitHub) |
| Style | CSS variables + mode sombre |

## Fonctionnalités

- Inscription, connexion et déconnexion (Supabase Auth)
- Routes protégées : le tableau de bord n'est accessible qu'une fois connecté
- Tableau Kanban à 4 colonnes : *À faire · En cours · Validation · Terminée*
- Création, suppression et assignation de tâches (titre, description, statut, priorité, catégorie, échéance)
- Badges de priorité / statut / catégorie
- **Fonctionnalité libre — sous-tâches + commentaires** par tâche (tables `subtasks` et `comments`)
- Bonus : drag & drop entre colonnes, mises à jour temps réel (Realtime), filtres/recherche, vue calendrier, mode sombre
- Notifications e-mail à la création d'une tâche avec échéance
- Page profil (nom, mot de passe, photo via Supabase Storage)

## Installation locale

```bash
# 1. Cloner le dépôt
git clone https://github.com/Nathanael-Berthod/mon-kanban.git
cd mon-kanban

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env.local à la racine (voir ci-dessous), puis lancer
npm run dev
```

L'application démarre sur http://localhost:5173.

### Variables d'environnement

Créez un fichier `.env.local` (jamais commité) à la racine de `mon-kanban/` :

```bash
VITE_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_PUBLIQUE
```

Pour les notifications e-mail (déploiement Vercel uniquement), ajoutez côté serveur :

```bash
RESEND_API_KEY=VOTRE_CLE_RESEND
```

### Base de données

Le schéma relationnel est documenté dans [`../SCHEMA_BDD.dbml`](../SCHEMA_BDD.dbml) (importable sur [dbdiagram.io](https://dbdiagram.io)).
La migration des tables ajoutées (`subtasks`, `comments`, colonne `assigned_to`, Realtime) se trouve dans [`supabase_migration.sql`](supabase_migration.sql) — à exécuter dans **Supabase → SQL Editor**.

## Scripts disponibles

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement (HMR) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Analyse ESLint |

## Structure du projet

```
mon-kanban/
├── api/send-email.js          # Fonction serverless Vercel (Resend)
├── src/
│   ├── lib/supabase.js        # Client Supabase
│   ├── hooks/useDarkMode.js   # Hook mode sombre
│   ├── pages/                 # LoginPage, DashboardPage, ProfilePage
│   └── components/            # Navbar, TaskList, TaskCard, TaskForm,
│                              # TaskDetailModal, FilterBar, CalendarView,
│                              # BoardSelector, UserTable
└── supabase_migration.sql     # Migration BDD (fonctionnalité libre + Realtime)
```

## Sécurité

- Clés Supabase chargées via variables d'environnement (`.env.local` ignoré par Git)
- Aucune clé `service_role` exposée côté client
- Row Level Security (RLS) activé sur les tables Supabase
