# syntax=docker/dockerfile:1

# =========================================================================
# base — PHP 8.4 FPM (Alpine) with all runtime extensions this project needs
# =========================================================================
FROM php:8.4-fpm-alpine AS base

# Robust, arm64-safe extension installer (works cleanly on Apple Silicon).
COPY --from=mlocati/php-extension-installer:2 /usr/bin/install-php-extensions /usr/local/bin/

# pdo_pgsql/pgsql -> Postgres · bcmath -> exact money math · intl -> locale
# formatting · zip -> composer · opcache -> perf · pcntl -> queue:work signals
RUN install-php-extensions \
      pdo_pgsql pgsql \
      bcmath \
      intl \
      zip \
      opcache \
      pcntl

# `fcgi` gives us cgi-fcgi for a real php-fpm healthcheck; git/unzip for composer.
RUN apk add --no-cache fcgi git unzip

COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-app.ini

WORKDIR /var/www/html

# =========================================================================
# vendor — composer dependencies, cached on the lockfile
# =========================================================================
FROM base AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY api/composer.json api/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# =========================================================================
# dev — full dependencies, bind-mount friendly (used by docker-compose.yml)
# =========================================================================
FROM base AS dev
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
ENTRYPOINT ["entrypoint"]
CMD ["php-fpm"]

# =========================================================================
# final — production-ish image with code + optimized autoloader baked in
# =========================================================================
FROM base AS final
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=vendor /var/www/html/vendor ./vendor
COPY api/ ./
RUN composer dump-autoload --optimize --no-dev \
 && php artisan config:cache \
 && php artisan route:cache \
 && chown -R www-data:www-data storage bootstrap/cache
CMD ["php-fpm"]
