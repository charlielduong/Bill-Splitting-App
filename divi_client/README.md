# Divi Client

This directory contains the React Native/Expo client:

- `src/components/` — shared UI and navigation components
- `src/data/` — client-side Supabase client and repository boundaries
- `src/domain/` — framework-independent money and allocation rules
- `src/screens/` — feature screens and interaction flows
- `src/services/` — external handoff adapters such as Venmo
- `src/theme/` — design tokens and styles

The Expo entry points remain at the repository root (`App.tsx`, `index.ts`) so existing `npm start`, `npm run ios`, and `npm run web` commands continue to work.
