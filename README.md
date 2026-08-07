# Investment Manager — Coderockr Fullstack Test

Fullstack application to store and manage investments, with compound-interest gain
calculation and age-based withdrawal taxation.

- **Backend:** Laravel 13 (PHP 8.4) — JSON REST API, PostgreSQL, fully decoupled.
- **Frontend:** Vue 3 + Vite + TypeScript — separate SPA (deploy-independent).
- **Infra:** Docker Compose (php-fpm + nginx + Postgres + Mailpit + Vite) + Makefile.

> 🚧 Work in progress — this README is filled in incrementally as the project is built.
> See [`docs/`](docs/) for the API documentation and the sections below for how to run it.

## Quick start

```bash
make up
```

Then open:

| Service | URL |
|---|---|
| API | http://localhost:8080 |
| API docs (OpenAPI) | http://localhost:8080/docs/api |
| SPA | http://localhost:5173 |
| Mailpit (caught e-mails) | http://localhost:8025 |

## Documentation

Detailed sections (architecture, third-party libraries, build instructions, tests,
screenshots) are added as each part of the project lands.
