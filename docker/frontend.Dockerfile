# =====================================================================
# Image de production pour le frontend Nuxt 4 (SPA statique).
# Build en deux étapes : génération statique, puis service via nginx.
# Construite depuis la racine du projet : docker build -f docker/frontend.Dockerfile .
# =====================================================================

# --- Étape 1 : build statique -----------------------------------------
FROM node:22-alpine AS build

# Évite tout prompt interactif lors du téléchargement de pnpm par corepack
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /app

# Code du frontend (le contexte de build est la racine du dépôt)
COPY frontend/ ./

# Installation des dépendances (lockfile non versionné -> pas de --frozen-lockfile)
RUN pnpm install

# Variables consommées par nuxt.config.ts (runtimeConfig.public) au build.
# Le frontend étant statique, ces valeurs sont figées dans le bundle généré.
ARG APP_NAME=AppMobile
ARG WEBAPI_URL=http://localhost:8000
ARG APPAPI_URL=http://10.0.2.2:8000
ARG GOOGLE_MAPS_API_KEY=
ENV APP_NAME=$APP_NAME \
    APP_ENV=web \
    WEBAPI_URL=$WEBAPI_URL \
    APPAPI_URL=$APPAPI_URL \
    GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY \
    NUXT_APP_BASE_URL=/

# Génère le site statique dans .output/public
RUN pnpm generate

# --- Étape 2 : service statique ---------------------------------------
FROM nginx:alpine AS serve

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html

EXPOSE 80
