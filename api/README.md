# Investment Manager API

Laravel JSON API for the Coderockr Fullstack Test. It handles authentication,
investment creation and listing, compound-interest calculations, withdrawal
taxation, queued notification e-mails and OpenAPI documentation.

## Local development

The API is intended to run through the Docker Compose setup in the repository
root:

```bash
make up
```

Once running:

- API: <http://localhost:8080/api>
- Interactive documentation: <http://localhost:8080/docs/api>
- OpenAPI document: <http://localhost:8080/docs/api.json>

## Quality checks

From the repository root:

```bash
make test
make lint
```

For architecture, business rules, configuration and complete setup
instructions, see the [main project README](../README.md).
