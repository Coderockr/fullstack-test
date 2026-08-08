# Investment Manager Web

Vue 3 single-page application for managing investments through the decoupled
Laravel API. The interface follows the supplied Figma design and includes
responsive investment listing, creation, detail and withdrawal flows.

## Local development

The recommended setup runs the complete project through Docker Compose from the
repository root:

```bash
make up
```

The application will be available at <http://localhost:5173>.

To run only the frontend locally:

```bash
npm ci
cp .env.example .env
npm run dev
```

## Quality checks

```bash
npm run type-check
npm run lint
npm run test -- --run
npm run build
```

For the complete setup and architecture documentation, see the
[main project README](../README.md).
