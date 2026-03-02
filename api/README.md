# AppMobile API

API REST construite avec **Laravel 12** et **PHP 8.3**, utilisant **Laravel Sanctum** pour l'authentification par token.

## Prérequis

- PHP >= 8.2
- Composer
- MySQL 8
- Docker (optionnel, via DevContainer)

## Installation

```bash
# Cloner le projet et se placer dans le dossier API
cd api

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé de l'application
php artisan key:generate

# Lancer les migrations et les seeders
php artisan migrate --seed
```

Ou en une seule commande :

```bash
composer setup
```

## Environnement Docker (DevContainer)

Le projet inclut un DevContainer avec 3 services :

| Service   | Port | Description                    |
|-----------|------|--------------------------------|
| **app**   | 8000 | API Laravel (PHP 8.3-cli)      |
| **db**    | 3306 | MySQL 8                        |
| **adminer** | 8082 | Interface web pour la base de données |

### Identifiants base de données

| Variable      | Valeur     |
|---------------|------------|
| `DB_HOST`     | db         |
| `DB_DATABASE` | app        |
| `DB_USERNAME` | user       |
| `DB_PASSWORD` | password   |

## Lancer le serveur

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## Commandes utiles

```bash
# Lancer les migrations
php artisan migrate

# Réinitialiser la base et relancer les seeders
php artisan migrate:fresh --seed

# Lancer les tests
composer test

# Formater le code
./vendor/bin/pint

# Ouvrir le shell Tinker
php artisan tinker

# Vider les caches
php artisan optimize:clear
```

## Endpoints API

### Routes publiques

| Méthode | URI               | Description              |
|---------|-------------------|--------------------------|
| GET     | `/api/ping`       | Health check             |
| POST    | `/api/login`      | Connexion utilisateur    |
| GET     | `/api/posts`      | Liste des posts          |
| GET     | `/api/posts/{id}` | Détail d'un post         |
| POST    | `/api/posts`      | Créer un post            |
| PUT     | `/api/posts/{id}` | Modifier un post         |
| DELETE  | `/api/posts/{id}` | Supprimer un post        |

### Routes protégées (auth:sanctum)

| Méthode | URI                  | Description              |
|---------|----------------------|--------------------------|
| POST    | `/api/logout`        | Déconnexion              |
| GET     | `/api/user`          | Profil utilisateur       |
| PUT     | `/api/user`          | Modifier le profil       |
| PUT     | `/api/user/password` | Modifier le mot de passe |
| POST    | `/api/user/avatar`   | Upload d'avatar          |

### Authentification

L'API utilise **Laravel Sanctum** avec des tokens Bearer. Après connexion via `POST /api/login`, inclure le token dans les requêtes protégées :

```
Authorization: Bearer <token>
```

## Modèles

### User

| Champ      | Type   |
|------------|--------|
| firstname  | string |
| lastname   | string |
| email      | string |
| password   | string |
| avatar     | string |

**Relations :** `hasMany` Post

### Post

| Champ       | Type    |
|-------------|---------|
| description | string  |
| image       | string (nullable) |
| user_id     | foreignId |

**Relations :** `belongsTo` User

## Seeders

Le seeder par défaut crée :
- **10 utilisateurs** (mot de passe : `password`)
- **50 posts** répartis aléatoirement entre les utilisateurs
