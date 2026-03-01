FROM php:8.3-cli

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    zip \
    && docker-php-ext-install pdo pdo_mysql pcntl zip

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer