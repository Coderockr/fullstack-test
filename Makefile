
# ============================================================================
#  Investment Manager — developer entrypoints
#  `make up` builds, starts, migrates and seeds the whole stack in one command.
# ============================================================================

DC        := docker compose
APP       := $(DC) exec -T app
WEB       := $(DC) exec -T web

.DEFAULT_GOAL := help
.PHONY: help up down destroy build install migrate seed fresh key test lint fix docs logs shell psql wait-db env

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

env: ## Create .env files from examples if missing
	@[ -f .env ] || cp .env.example .env
	@[ -f api/.env ] || cp api/.env.example api/.env
	@[ -f web/.env ] || cp web/.env.example web/.env
	@echo "env files ready"

up: env ## Build + start everything, then migrate & seed (first-run friendly)
	$(DC) up -d --build
	$(MAKE) wait-db
	$(APP) composer install
	$(APP) php artisan key:generate --force
	$(APP) php artisan migrate --seed --force
	@echo ""
	@echo "  API   -> http://localhost:$${API_HTTP_PORT:-8080}"
	@echo "  Docs  -> http://localhost:$${API_HTTP_PORT:-8080}/docs/api"
	@echo "  SPA   -> http://localhost:$${WEB_HTTP_PORT:-5173}"
	@echo "  Mail  -> http://localhost:8025"

down: ## Stop and remove containers
	$(DC) down

destroy: ## Stop and remove containers + volumes (DB wiped)
	$(DC) down -v

build: ## Rebuild images
	$(DC) build

install: ## Install PHP + JS dependencies
	$(APP) composer install
	$(WEB) npm ci

migrate: ## Run database migrations
	$(APP) php artisan migrate

seed: ## Seed the database
	$(APP) php artisan db:seed

fresh: ## Drop, re-migrate and re-seed the database
	$(APP) php artisan migrate:fresh --seed

key: ## Generate the Laravel app key
	$(APP) php artisan key:generate --force

test: ## Run backend + frontend test suites
	$(APP) php artisan test
	$(WEB) npm run test -- --run

lint: ## Style + static analysis + type-check
	$(APP) ./vendor/bin/pint --test
	$(APP) ./vendor/bin/phpstan analyse
	$(WEB) npm run lint
	$(WEB) npm run type-check

fix: ## Auto-fix code style
	$(APP) ./vendor/bin/pint
	$(WEB) npm run lint -- --fix

docs: ## Export the OpenAPI spec to docs/openapi.json
	$(APP) php artisan scramble:export --path=docs/openapi.json

logs: ## Tail all container logs
	$(DC) logs -f

shell: ## Open a shell in the API container
	$(DC) exec app sh

psql: ## Open a psql session
	$(DC) exec postgres psql -U $${DB_USERNAME:-investments} -d $${DB_DATABASE:-investments}

wait-db: ## Block until Postgres is accepting connections
	@until $(DC) exec -T postgres pg_isready -U $${DB_USERNAME:-investments} >/dev/null 2>&1; do \
		echo "waiting for postgres..."; sleep 1; \
	done
	@echo "postgres ready"
