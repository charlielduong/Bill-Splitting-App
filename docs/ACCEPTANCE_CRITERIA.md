# Divi MVP Acceptance Criteria

The MVP is complete only when every applicable criterion below is demonstrably satisfied.

## Product Flows

- [ ] A user can authenticate and reach Home.
- [ ] A user can create a Draft Divi from Camera, Photos, or manual entry.
- [ ] Receipt parsing proposes structured values and never blocks manual correction or completion.
- [ ] The creator can reconcile items, subtotal, tax, tip, discounts, fees, currency, and total.
- [ ] Confirming the receipt moves the Divi to Claiming and locks financial values.
- [ ] A Claiming Divi produces a revocable QR/universal-link invitation.
- [ ] A full-app recipient opens the exact invited Divi, joins, and claims items.
- [ ] An App Clip recipient joins with lightweight identity and completes the essential claim flow without a full account.
- [ ] Multiple participants observe synchronized claims and may share an item.
- [ ] The creator can reset Claiming to Draft only after acknowledging that claims will be removed.
- [ ] Finalization is blocked for unclaimed required items or failed financial invariants.
- [ ] Successful finalization atomically persists immutable allocations.
- [ ] Participants see a transparent final breakdown and who they owe.
- [ ] The payer sees every reimbursement obligation and status.
- [ ] A finalized balance owed to the current user displays **Request with Venmo** when an appropriate handoff is available.
- [ ] Divi prefers an explicit participant Venmo username and never assumes a phone number or email is the correct Venmo account.
- [ ] Divi attempts to prepare the recipient, exact outstanding amount, safe Divi-derived note, and request transaction type using supported Venmo capabilities.
- [ ] Unsupported or unavailable Venmo capabilities degrade to an easy-to-copy recipient, amount, and note without blocking another settlement method.
- [ ] The user must review and manually submit the request inside Venmo; Divi never automatically executes it.
- [ ] Launching Venmo may record **Request initiated** but does not mark any amount paid.
- [ ] Only explicit authorized confirmation, or a future verified provider integration, changes a balance to Paid.
- [ ] Full and partial repayments update the remaining obligation correctly.
- [ ] A Divi becomes Settled only when every obligation is fully paid.
- [ ] Historical receipts, allocations, activity, and settlement records remain available.

## Correctness and Security

- [ ] Every allocation component and final participant total reconciles exactly in minor units.
- [ ] Invalid, expired, revoked, or cross-Divi invitation tokens grant no access.
- [ ] Duplicate mutations create no duplicate participants, claims, finalizations, or payments.
- [ ] Stale clients cannot perform invalid lifecycle transitions.
- [ ] Backend authorization protects all Divi, receipt, claim, allocation, and settlement data.
- [ ] No credentials or secrets are committed.
- [ ] Logs, analytics, links, and crash metadata exclude sensitive receipt and financial content.
- [ ] Account deletion is available and preserves anonymized financial history where required.

## Experience Quality

- [ ] Core screens provide loading, empty, recoverable-error, stale/conflict, in-progress, and success states.
- [ ] VoiceOver labels, Dynamic Type, 44 × 44 pt targets, sufficient contrast, and non-color status cues are present.
- [ ] Common navigation feels immediate and long-running work never blocks the main thread.
- [ ] The five-position bottom navigation and elevated center Create Divi action behave as specified.
- [ ] The App Clip excludes unrelated onboarding and full-app navigation.

## Build and Documentation

- [ ] Documented setup initializes the database and development configuration without undocumented source changes.
- [ ] The full app type-checks, passes automated tests, and produces an Expo bundle for the documented local environment.
- [ ] Before App Clip work begins, its native target, association domain, and shared-contract strategy are explicitly approved and documented.
- [ ] Automated unit and integration tests pass.
- [ ] README, environment template, migrations, preview/seed data, and verified commands are current.

## Required Test Coverage

- Lifecycle transition permissions and stale-version rejection.
- One claimant and multiple claimants.
- Shared item with an uneven minor-unit remainder.
- Proportional tax, tip, fee, and discount allocation with rounding.
- Zero adjustment and very small amounts.
- Failed and partially successful receipt parsing.
- Unclaimed item blocking finalization.
- Concurrent and duplicate claims.
- Atomic finalization and duplicate finalization.
- Full, partial, excessive, and duplicate payment attempts.
- Venmo handoff with every supported field, partial field support, missing Venmo username, Venmo unavailable, handoff failure, and cancellation/return without payment.
- Separation of Request initiated from Outstanding, Partially Paid, and Paid monetary states.
- Invalid/revoked/expired invitation behavior.
- Deleted or anonymized participant history.
- Authentication expiration and network failure recovery.
- Compact and large iPhone layouts plus an accessibility Dynamic Type size.
