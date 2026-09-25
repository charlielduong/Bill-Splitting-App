# Divi

Divi is a receipt-first bill-splitting app built with React Native, Expo, TypeScript, and a local Docker-backed Supabase stack. The receipt and claiming UI still has deterministic local fallback data, while the persistence foundation and development seed are now available through Supabase.

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```sh
npm install
npm start
```

From the Expo terminal, press `i` for the iOS Simulator, `w` for a browser, or scan the QR code with Expo Go on a compatible physical iPhone. You can also start a target directly:

```sh
npm run ios
npm run web
```

Choose **Try local demo** on the welcome screen.

## Local Supabase development

Requirements: Docker Desktop and the Supabase CLI (`brew install supabase/tap/supabase`).

```sh
npm run supabase:start
npm run supabase:status
```

Copy `.env.example` to `.env` and add the local URL and anon key printed by `npm run supabase:status`. Open [http://127.0.0.1:54324](http://127.0.0.1:54324) to inspect magic-link emails captured by the local inbox, then run `npm start`.

The initial database reset applies `divi_server/supabase/migrations/` and loads the six-person **Dinner at Barcelona** development seed from `divi_server/supabase/seed.sql`. The seeded local account is `dev@divi.local`; local email delivery is captured by Inbucket and never sends a real email.

Stop the stack with `npm run supabase:stop`. Reset and reseed it with `npm run supabase:reset`.

## Run the client with Docker Compose

The safer Compose setup runs the Expo web client without granting any container access to the host Docker daemon. Start Supabase separately first, then start the client:

```sh
npm run supabase:start
docker compose up --build
```

The client is available at [http://localhost:8083](http://localhost:8083). Supabase Studio remains available at [http://localhost:54323](http://localhost:54323), and the local email inbox is at [http://localhost:54324](http://localhost:54324).

Stop the client with `docker compose down`. The `divi_server/Dockerfile` packages the Supabase CLI and server migrations for validation or future server-side tooling; it intentionally does not control the host Docker daemon.

## What is ready to review

- Acorns-inspired green, white, and black visual language
- Five-tab navigation with an elevated **Create Divi** action
- Receipt photo selection and simulated receipt parsing
- Editable claim flow with shared items
- QR invitation display
- Deterministic proportional allocation of tax, tip, fees, and discounts
- Final balances and explicit paid state
- Best-effort Venmo request handoff with copyable fallback details
- Activity, receipt history, and profile surfaces

## Verify the project

```sh
npm run typecheck
npm test
npm run export:web
```

## Current integration boundaries

- Authentication is transitioning from the local demo adapter to Supabase email magic links.
- Receipt parsing is simulated; selected images are not uploaded.
- Supabase persistence schema, RLS policies, and a typed repository foundation are available; the remaining screen wiring is staged separately from the local fallback.
- Venmo uses a best-effort URL handoff. Opening Venmo marks a request as initiated, not paid.
- Apple/Google authentication, production credentials, native App Clip support, and deployment are intentionally outside this local development milestone.

See `divi_client/` for the Expo client, `divi_server/` for the local Supabase backend, and `docs/` for product, flow, architecture, design, acceptance, and open-question specifications.
