# Divi

Divi is a receipt-first bill-splitting app built with React Native, Expo, and TypeScript. This first local-review build uses deterministic sample data and mock service adapters, so the complete core experience can be tested without accounts, API keys, or a backend.

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```sh
npm install
npm run ios
```

Receipt OCR uses Apple Vision on iOS and Google ML Kit on Android. It runs entirely on-device and therefore requires a native development build; stock Expo Go cannot load the OCR module.

Build and run the app in the iOS Simulator or Android emulator:

```sh
npm run ios
npm run android
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

### Google sign-in

Google sign-in is implemented through Supabase Auth and the Expo `divi://auth/callback` deep link.
To enable it locally:

1. Create a Google OAuth **Web application** client in Google Cloud.
2. Add `http://127.0.0.1:54321/auth/v1/callback` as an authorized redirect URI.
3. Copy `supabase/.env.example` to `supabase/.env` and add the Google client ID and secret.
4. Set `enabled = true` in `[auth.external.google]` in `supabase/config.toml`.
5. Restart Supabase with `npm run supabase:stop && npm run supabase:start`.
6. Rebuild the native app after changing the Expo scheme or native dependencies:

```sh
npm run ios
```

Google OAuth configuration for self-hosted Supabase is handled in the local configuration rather
than the hosted Dashboard. The app's sign-in button opens the provider in a browser and exchanges
the returned session through the configured deep link.

Choose **Try local demo** on the welcome screen.


To test the complete camera-to-claim flow with a real receipt on a connected iPhone, enable Developer Mode on the phone, connect it to the Mac, and run:

```sh
npm run ios:device
```

Choose **Try local demo**, tap the center **Create Divi** action, then take a receipt photo. The app asks you to confirm the image, performs OCR locally, and opens every detected value for correction before claiming starts. The web build remains available with `npm run web`, but OCR falls back to manual entry there.

## Debug receipt OCR on an iPhone

Use the installed **Divi development app**, not Expo Go. Keep the iPhone and Mac on the same Wi-Fi.

1. Open this project folder in VS Code.
2. In the project folder, start Metro with the development-client option:

   ```sh
   npx expo start --dev-client --lan
   ```

   Leave the terminal running. If port `8081` is already in use, use the existing Expo terminal or stop that server with **Ctrl+C** before starting another.
3. Open **Divi** on your iPhone. If it does not connect to Metro, scan the terminal’s QR code with the iPhone Camera and open the link in Divi.
4. In VS Code, open `src/services/receiptParser.ts`. Click the gutter beside line 99 to set a breakpoint inside `firstMerchantLine()`. When it pauses, inspect `lines` and `candidate`; use **Continue** to step through the candidates.
5. In Divi, tap **Create Divi**, take or choose a receipt, confirm the photo, and tap **Scan receipt**.

To inspect the raw OCR text before parsing, set another breakpoint in `src/screens/CreateDiviScreen.tsx` on the `recognizeText(...)` call, then inspect `result.text`. From the Metro terminal, press **j** to open React Native DevTools if VS Code does not pause at the breakpoint. If `result.text` is correct but the selected title or items are wrong, trace `parseReceiptText()` in `src/services/receiptParser.ts`.

## What is ready to review

- Acorns-inspired green, white, and black visual language
- Five-tab navigation with an elevated **Create Divi** action
- Camera and photo-library receipt capture with an image confirmation step
- On-device receipt OCR using Apple Vision (iOS) and Google ML Kit (Android)
- Editable OCR results with manual fallback and total reconciliation
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
- Receipt OCR runs locally; selected images are not uploaded.
- Receipt parsing is heuristic and always requires user review because store layouts vary.
- Storage is in memory and resets when the app reloads.
- Venmo uses a best-effort URL handoff. Opening Venmo marks a request as initiated, not paid.
- Supabase, production credentials, native App Clip support, and deployment are intentionally outside this first local walkthrough.

See `docs/` for product, flow, architecture, design, acceptance, and open-question specifications.
