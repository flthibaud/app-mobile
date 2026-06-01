# =====================================================================
# Image de production pour l'API Laravel (PHP 8.3)
# Construite depuis la racine du projet : docker build -f docker/api.Dockerfile .
# =====================================================================
FROM php:8.3-cli

# Dépendances système + extensions PHP nécessaires à Laravel + MySQL
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql pcntl zip \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copie du code de l'API (le contexte de build est la racine du dépôt)
COPY api/ ./

# Installation des dépendances PHP en mode production
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Entrypoint : attend la DB, génère la clé, migre/seed, link storage, puis sert
COPY docker/api-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

ENTRYPOINT ["entrypoint.sh"]
# Serveur PHP intégré (suffisant pour un test/démo) servant Laravel via public/
CMD ["php", "-d", "variables_order=EGPCS", "-S", "0.0.0.0:8000", "-t", "public"]
