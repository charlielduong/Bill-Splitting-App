# Divi Open Questions

These decisions are intentionally unresolved. Defaults may be used for local development, but production-cost, privacy, provider, and irreversible infrastructure choices require explicit approval.

## Product and Identity

- Is “Sign in with Venmo” technically and contractually available for this product, or should Venmo be a linked payment identity after Apple/Google authentication?
- Can an App Clip guest later merge claims and history into a full Divi account? If so, what proof links the identities?
- Does the MVP support one payer only in the UI, despite a multiple-payer-capable data model?
- Are groups still an MVP concept, or is a Divi the only user-facing container?
- Can optional items remain unclaimed at finalization, and how is an item marked optional?

## Receipt Parsing

- Which OCR/vision/reasoning provider should power production parsing?
- What monthly cost ceiling and data-processing region are acceptable?
- May receipt images be sent to a third-party AI provider, and what retention terms are required?
- Which confidence threshold should trigger stronger manual-review messaging?

## Invitations and App Clip

- What invitation expiry should be used by default?
- May a creator rotate a token without invalidating already joined participants?
- Which production domain will host universal-link and App Clip association files?
- Is the Apple Developer account configured for the required App Clip and associated-domain entitlements?

## Settlement and Venmo

- Which supported Venmo integration mechanism should the MVP use, and which of recipient, amount, note, and request/charge type can it reliably pre-populate on the minimum supported iOS version?
- What fallback destination should open when Venmo is installed but one or more fields cannot be pre-populated?
- Should users be able to copy each fallback field separately, or copy one formatted request summary?
- Who may record or correct repayment: payer, recipient, or both?
- Does recording payment require confirmation from the other party?
- How should overpayment be handled: reject, cap, or retain as a credit?

## Privacy and Operations

- What are the production retention periods for receipts, parse metadata, financial history, and deleted-account data?
- Is export required before public release even though it is outside the current MVP?
- Which privacy policy and terms will govern App Store/TestFlight use?
- Which analytics and crash-reporting provider, if any, is approved?
- What production hosting region and early monthly infrastructure budget are approved?

## Brand and Release

- What is the final Divi logo/app icon and approved primary green after accessibility testing?
- Is dark mode required for the first TestFlight build or only architecture-ready?
- What is the final bundle identifier and production domain?
- When should CI, TestFlight automation, push notifications, and public App Store submission enter scope?

## Decision Guardrails

Codex may choose internal naming, file organization, small reusable components, test structure, mock data, error organization, and replaceable implementation details.

Codex must ask before changing lifecycle semantics, allocation rules, payer relationships, authentication providers, backend provider, privacy/retention guarantees, App Clip participation, direct money movement, paid infrastructure, major dependencies, production credentials, or irreversible deployment state.

When ambiguity is non-material, choose the simplest replaceable approach and document it. When it affects financial correctness, security, privacy, user-visible core behavior, external cost, or irreversible state, stop and request a decision.
