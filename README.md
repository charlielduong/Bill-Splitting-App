# Divi

Divi is an iOS 18 SwiftUI prototype for receipt-first bill splitting. This local build uses deterministic sample data and mock service adapters so the primary flow can be reviewed without credentials.

## Run locally

1. Open `Divi.xcodeproj` in Xcode 26 or later.
2. Select the `Divi` scheme and an iPhone simulator running iOS 18 or later.
3. Run the app.
4. Choose **Try local demo**.

The demo supports receipt parsing simulation/manual entry, item claiming, QR invitation display, financial finalization, and a Venmo request handoff with fallback details.

## Verification

```sh
xcodebuild -project Divi.xcodeproj -scheme Divi -sdk iphonesimulator -configuration Debug CODE_SIGNING_ALLOWED=NO build
xcodebuild -project Divi.xcodeproj -scheme Divi -sdk iphonesimulator -configuration Debug CODE_SIGNING_ALLOWED=NO test
```

## Current integration boundaries

- Authentication is a local demo adapter.
- Receipt parsing is simulated.
- Storage is in memory.
- Venmo uses a best-effort URL handoff; the fallback displays request details.
- Supabase schema and production credentials are not required for this first local walkthrough.

See `docs/` for the complete product, flow, architecture, design, acceptance, and open-question specifications.
