# RideFlow

RideFlow is a Morocco-first mobility marketplace project. The current milestone is an interactive Casablanca ride demo in English, French and Arabic. Select two landmarks, review an itemized estimate, confirm, and advance through the simulated trip.

- [Architecture and implementation roadmap](docs/architecture-v2.md)
- [Database design and migration plan](docs/database-plan.md)

## Run locally

Use Node.js 24.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The demo operates entirely in the browser. It uses fixed landmarks, schematic routes and synthetic prices. A reload clears the ride. The app includes a PWA manifest and icons. Offline operation is pending.

The earlier Fastify health API is available separately via `PORT=3001 npm run api:dev`. The demo UI has no dependency on that server.

## Verify

```sh
npm run typecheck
npm test
npm run build
```
