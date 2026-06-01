#!/bin/sh
# =====================================================================
# Entrypoint de l'API : prépare l'environnement puis lance la commande.
# Idempotent : peut être relancé sans réinitialiser la base existante.
# =====================================================================
set -e

cd /app

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
DB_DATABASE="${DB_DATABASE:-app}"
DB_USERNAME="${DB_USERNAME:-user}"
DB_PASSWORD="${DB_PASSWORD:-password}"

# 1. Fichier .env (copié depuis l'exemple au premier démarrage)
if [ ! -f .env ]; then
    echo "[entrypoint] Création de .env depuis .env.example"
    cp .env.example .env
fi

# 2. Attente de la base de données
echo "[entrypoint] Attente de la base ${DB_HOST}:${DB_PORT}..."
until php -r 'exit(@fsockopen(getenv("DB_HOST"), (int) getenv("DB_PORT")) ? 0 : 1);'; do
    sleep 2
done
echo "[entrypoint] Base de données disponible."

# 3. Clé applicative (générée une seule fois)
if ! grep -q "^APP_KEY=base64:" .env; then
    echo "[entrypoint] Génération de la clé applicative"
    php artisan key:generate --force
fi

# 4. Détection d'une base déjà initialisée (pour ne seeder qu'une fois)
ALREADY_SEEDED=$(php -r '
    try {
        $pdo = new PDO(
            sprintf("mysql:host=%s;port=%s;dbname=%s", getenv("DB_HOST"), getenv("DB_PORT"), getenv("DB_DATABASE")),
            getenv("DB_USERNAME"),
            getenv("DB_PASSWORD")
        );
        echo (int) $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    } catch (Throwable $e) {
        echo 0;
    }
')

# 5. Migrations
echo "[entrypoint] Lancement des migrations"
php artisan migrate --force

# 6. Seeders (uniquement si la base était vide)
if [ "$ALREADY_SEEDED" -eq 0 ]; then
    echo "[entrypoint] Base vide -> exécution des seeders"
    php artisan db:seed --force
else
    echo "[entrypoint] Base déjà peuplée (${ALREADY_SEEDED} utilisateurs) -> seeders ignorés"
fi

# 7. Lien symbolique pour les fichiers publics (avatars, etc.)
php artisan storage:link 2>/dev/null || true

# 8. Caches Laravel
php artisan config:clear >/dev/null 2>&1 || true

exec "$@"
