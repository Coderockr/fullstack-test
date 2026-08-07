#!/bin/sh
# Dev entrypoint for the php-fpm container.
# Keeps the container self-healing without owning migrations/seeds
# (those are orchestrated once by `make up` to avoid app/queue races).
set -e

cd /var/www/html

# 1. Ensure dependencies exist (first run against a fresh bind mount).
if [ ! -f vendor/autoload.php ]; then
  echo "[entrypoint] vendor/ missing — running composer install..."
  composer install --no-interaction --prefer-dist
fi

# 2. Ensure an .env exists and has an APP_KEY.
if [ ! -f .env ]; then
  echo "[entrypoint] .env missing — copying from .env.example..."
  cp .env.example .env
fi
if ! grep -q '^APP_KEY=base64:' .env; then
  echo "[entrypoint] generating APP_KEY..."
  php artisan key:generate --force
fi

# 3. Wait for Postgres to accept connections (PDO retry loop).
echo "[entrypoint] waiting for database at ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
until php -r '
  try {
    new PDO(
      sprintf("pgsql:host=%s;port=%s;dbname=%s", getenv("DB_HOST") ?: "postgres", getenv("DB_PORT") ?: "5432", getenv("DB_DATABASE") ?: "investments"),
      getenv("DB_USERNAME") ?: "investments",
      getenv("DB_PASSWORD") ?: "secret"
    );
    exit(0);
  } catch (Throwable $e) { exit(1); }
' 2>/dev/null; do
  sleep 1
done
echo "[entrypoint] database is up."

# 4. Make sure writable dirs are writable.
chmod -R ug+rw storage bootstrap/cache 2>/dev/null || true

exec "$@"
