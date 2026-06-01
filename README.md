# AppMobile

Application full-stack composée de :

- **`api/`** — API REST **Laravel 12 / PHP 8.3** (authentification par token via Laravel Sanctum, base MySQL 8).
- **`frontend/`** — Application **Nuxt 4** (SPA statique) packageable en application Android via **Capacitor**.

Plusieurs façons de lancer le projet :

| Objectif | Méthode | Section |
|----------|---------|---------|
| Développer (hot-reload, outils) | **DevContainer** | [Développement](#développement-devcontainer) |
| Tester / faire tourner rapidement | **Docker Compose** (build) | [Démo / test](#démo--test-docker-compose) |
| Tester l'app mobile sur émulateur | **Docker Compose** (API) + **Capacitor** | [Version mobile](#tester-lapp-mobile-sur-émulateur-android) |

---

## Démo / test (Docker Compose)

Pour récupérer le projet et le tester sans installer PHP, Node ni MySQL : seul **Docker** (avec le plugin Compose) est requis.

```bash
# Depuis la racine du dépôt
docker compose up --build
```

Au premier lancement, l'API attend la base, génère sa clé applicative, exécute les migrations puis les seeders (10 utilisateurs, 50 posts, 50 annonces). Les redémarrages suivants ne re-seedent pas la base.

| Service | URL / Port | Description |
|---------|-----------|-------------|
| **Frontend** | http://localhost:8080 | Application web (Nuxt statique servie par nginx) |
| **API** | http://localhost:8000 | API Laravel (ex. `GET /api/ping`) |
| **Adminer** | http://localhost:8082 | Interface web pour la base MySQL |
| **MySQL** | `localhost:3306` | Base de données |

### Identifiants

- **Base de données** — serveur : `db`, base : `app`, utilisateur : `user`, mot de passe : `password` (root : `root`).
- **Comptes de démo** — les utilisateurs générés par les seeders ont tous le mot de passe `password`.

### Clé Google Maps (optionnel)

La carte du frontend nécessite une clé Google Maps. Pour l'injecter dans le build statique, définissez la variable avant de builder (ou placez-la dans un fichier `.env` à la racine, lu par Compose, ou l'ajoutez directement dans `docker-compose.yml`) :

```bash
GOOGLE_MAPS_API_KEY=VOTRE_CLE_GOOGLE_MAPS
```

### Commandes utiles

```bash
docker compose up --build db api    # lancer uniquement la base + l'API
docker compose up --build -d        # lancer en arrière-plan
docker compose logs -f api          # suivre les logs de l'API
docker compose exec api php artisan migrate:fresh --seed   # réinitialiser la base
docker compose down                 # arrêter
docker compose down -v              # arrêter + supprimer la base (volume mysql-data)
```

> **Note** — Cette stack vise la démo/test : l'API est servie par le serveur PHP intégré et les fichiers uploadés (avatars) ne sont pas persistés entre rebuilds d'image. Le frontend étant statique, l'URL de l'API (`WEBAPI_URL`) est figée au build (`http://localhost:8000`) ; adaptez l'argument de build dans `docker-compose.yml` pour un autre hôte.

---

## Tester l'app mobile sur émulateur (Android)

Capacitor emballe le frontend Nuxt dans une application Android. L'application étant exécutée sur un téléphone (virtuel), elle ne peut pas joindre l'API via `localhost` : l'émulateur Android utilise l'adresse spéciale **`10.0.2.2`** pour atteindre la machine hôte. C'est déjà configuré (`APPAPI_URL=http://10.0.2.2:8000` dans `frontend/.env`) — l'API lancée par Docker Compose sur le port `8000` est donc directement joignable.

### Prérequis

- **[Android Studio](https://developer.android.com/studio)** installé, avec un **émulateur (AVD)** créé et fonctionnel (menu *Device Manager*).
- Les dépendances du frontend installées :

  ```bash
  pnpm --dir frontend install
  ```

### Lancer

1. **Copier le .env.example** du frontend pour définir les variables d'environnement :

   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. **Démarrer l'API + la base** (dans un terminal, à la racine du dépôt) :

   ```bash
   docker compose up --build db api
   ```

3. **Construire l'app mobile et la lancer sur l'émulateur** (dans un second terminal) :

   ```bash
   cd frontend
   APP_ENV=mobile pnpm android   # build le frontend + l'injecte dans le projet Android
   npx cap run android           # démarre l'émulateur, installe et ouvre l'app
   ```

   > `npx cap run android` propose de choisir l'émulateur à démarrer. L'app s'ouvre ensuite automatiquement et se connecte à l'API.

À chaque modification du frontend, relancer la commande de l'étape 3 pour reconstruire et réinstaller l'app.

---

## Développement (DevContainer)

L'environnement de développement utilise un **DevContainer** (VS Code / GitHub Codespaces) défini dans [.devcontainer/](.devcontainer/). Il fournit PHP 8.3, Node 22, pnpm, MySQL et Adminer, avec les extensions VS Code pré-installées.

1. Ouvrir le projet dans VS Code puis **« Reopen in Container »**.
2. Installer les dépendances et préparer l'API :

   ```bash
   # API
   cd api && composer setup && cd ..
   # Frontend
   pnpm --dir frontend install
   ```

3. Lancer l'API et le frontend en parallèle (hot-reload) :

   ```bash
   pnpm dev
   ```

   - `pnpm api` — uniquement l'API (port 8000)
   - `pnpm front` — uniquement le frontend (Nuxt dev)

Détails spécifiques à chaque partie :

- API : [api/README.md](api/README.md)
- Frontend / build Android : [frontend/README.md](frontend/README.md)

---

## Structure

```
appmobile/
├── api/                 # API Laravel 12
├── frontend/            # Application Nuxt 4 + Capacitor (Android)
├── .devcontainer/       # Environnement de développement
├── docker/              # Dockerfiles + config nginx pour la stack de démo
├── docker-compose.yml   # Stack de démo/test (docker compose up --build)
└── package.json         # Scripts dev (concurrently : api + front)
```
