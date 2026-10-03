# Google Authentication with Expo and Supabase

## End-to-end flow

```text
Expo app
  → Supabase OAuth request
  → Google account login
  → Google redirects to Supabase
  → Supabase creates a session
  → Supabase redirects back to Expo
  → Expo stores and uses the session
```

1. The user taps Google sign-in. The app calls `supabase.auth.signInWithOAuth()` with Google and an app redirect URL.
2. Supabase opens Google’s authorization page.
3. Google authenticates the user and redirects to Supabase’s callback URL:
   `https://<project-ref>.supabase.co/auth/v1/callback`
4. Supabase verifies the Google response, creates or finds the user, and creates an access/refresh-token session.
5. Supabase redirects to the app. The Supabase client reads the response and persists the session.
6. The app listens for auth changes and renders the authenticated or signed-out experience.

## Configuration

There are two different redirect destinations:

- **Google → Supabase:** configure the Supabase callback URL in the Google Cloud OAuth client.
- **Supabase → Expo:** add the app redirect URL to Supabase’s allowed redirect URLs. This may be `http://localhost:8081` for Expo web or a custom deep link for a native build.

In Supabase, configure the Google provider with the Google OAuth client ID and client secret. In Google Cloud, configure the OAuth consent screen and the web OAuth client.

## Environment variables

The Expo app uses:

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

The URL identifies the Supabase project. The publishable key is intended for client apps and is not a password. Never put the Supabase service-role key in Expo code; it bypasses security controls and belongs only on a trusted server.

## Sessions and users

The Supabase client persists the session locally and refreshes tokens when needed. Use `supabase.auth.getSession()` for the current session and `supabase.auth.onAuthStateChange()` for events such as `SIGNED_IN`, `SIGNED_OUT`, and `TOKEN_REFRESHED`.

The authenticated user is available at `session.user`. Useful fields include `email`, `user_metadata.full_name`, and `user_metadata.avatar_url`. Users can be viewed in Supabase under **Authentication → Users**.

Sign out with:

```ts
await supabase.auth.signOut();
```

## Database security

Google verifies the user’s identity; Supabase represents it with `auth.users.id`. Protect application tables with Row Level Security policies, commonly matching a row’s `user_id` to `auth.uid()`. The publishable key is safe to ship only when RLS policies correctly restrict access.
