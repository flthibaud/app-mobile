# AppMobile

Application full-stack composée de :

- **`api/`** — API REST **Laravel 12 / PHP 8.3** (authentification par token via Laravel Sanctum, base MySQL 8).
- **`frontend/`** — Application **Nuxt 4** (SPA statique) packageable en application Android via **Capacitor**.

Deux façons de lancer le projet :

| Objectif | Méthode | Section |
|----------|---------|---------|
| Développer (hot-reload, outils) | **DevContainer** | [Développement](#développement-devcontainer) |
| Tester / faire tourner rapidement | **Docker Compose** (build) | [Démo / test](#démo--test-docker-compose) |

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

La carte du frontend nécessite une clé Google Maps. Pour l'injecter dans le build statique, définissez la variable avant de builder (ou placez-la dans un fichier `.env` à la racine, lu par Compose) :

```bash
GOOGLE_MAPS_API_KEY=VOTRE_CLE docker compose up --build
```

### Commandes utiles

```bash
docker compose up --build -d        # lancer en arrière-plan
docker compose logs -f api          # suivre les logs de l'API
docker compose exec api php artisan migrate:fresh --seed   # réinitialiser la base
docker compose down                 # arrêter
docker compose down -v              # arrêter + supprimer la base (volume mysql-data)
```

> **Note** — Cette stack vise la démo/test : l'API est servie par le serveur PHP intégré et les fichiers uploadés (avatars) ne sont pas persistés entre rebuilds d'image. Le frontend étant statique, l'URL de l'API (`WEBAPI_URL`) est figée au build (`http://localhost:8000`) ; adaptez l'argument de build dans `docker-compose.yml` pour un autre hôte.

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
