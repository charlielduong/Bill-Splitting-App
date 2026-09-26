# Divi

Divi is a receipt-first bill-splitting app built with React Native, Expo, and TypeScript. This first local-review build uses deterministic sample data and mock service adapters, so the complete core experience can be tested without accounts, API keys, or a backend.

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

## Local Supabase

This project includes the Supabase CLI configuration for a Docker-backed local stack. Make sure
Docker Desktop is running, then start Supabase with:

```sh
npm run supabase:start
```

The local API is available at `http://127.0.0.1:54321`, Studio at
`http://127.0.0.1:54323`, and Postgres at `127.0.0.1:54322`. The CLI applies migrations from
`supabase/migrations` and seed data from `supabase/seed.sql`.

After the first start, copy the generated publishable key into `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-key-from-supabase-start>
```

Use `npm run supabase:stop` to stop the containers, `npm run supabase:status` to inspect them, and
`npm run supabase:reset` to recreate the database from migrations and seed data.

Choose **Try local demo** on the welcome screen.

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

- Authentication is a local demo adapter.
- Receipt parsing is simulated; selected images are not uploaded.
- Storage is in memory and resets when the app reloads.
- Venmo uses a best-effort URL handoff. Opening Venmo marks a request as initiated, not paid.
- Supabase, production credentials, native App Clip support, and deployment are intentionally outside this first local walkthrough.

See `docs/` for product, flow, architecture, design, acceptance, and open-question specifications.
