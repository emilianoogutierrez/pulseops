# Development

## Local setup

PulseOps now requires PostgreSQL for authenticated product surfaces.

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run prisma:generate
npm run db:push
npm run db:seed:demo
npm run dev
```

The demo seed is synthetic and is refused unless `PULSEOPS_DEMO_MODE=true`. The checked-in `.env.example` enables that flag for local development only.

Default local credentials:

```text
Email: demo@pulseops.local
Password: pulseops-demo-password
```

Change `DEMO_PASSWORD` before seeding if required.

## Resetting demo state

Running `npm run db:seed:demo` clears business/demo records inside the seeded workspace and recreates a deterministic walkthrough. Do not point demo seeding at a production database.

## Quality checks

```bash
npm run check:public
npm run lint
npm run typecheck
npm run test
npm run build
```

With the local PostgreSQL container running and seeded:

```bash
npm run test:integration
```

Browser smoke requires Playwright browser binaries:

```bash
npx playwright install chromium
npm run e2e -- --project=chromium
```
