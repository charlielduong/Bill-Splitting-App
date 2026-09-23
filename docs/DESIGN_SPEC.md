# Divi Design Specification

## 1. Design Direction

Divi should use a clean, friendly, high-confidence visual language inspired by the supplied Acorns references. The references establish visual principles only; Divi must use its own brand, icons, copy, illustrations, information architecture, and product-specific layouts.

The defining qualities are:

- A restrained green, white, and near-black palette.
- Large, highly legible financial information.
- Generous whitespace and deliberate vertical rhythm.
- Rounded controls and soft geometric containers.
- Strong hierarchy with very little decorative chrome.
- Full-width pill-shaped primary actions.
- Simple rows separated by subtle dividers.
- A persistent bottom navigation bar with an elevated center action for **Create Divi**.
- Green hero surfaces for high-emphasis summaries and brand moments.

Do not reproduce Acorns trademarks, logos, investment content, proprietary illustrations, chart compositions, or exact icon artwork. Translate the visual language into Divi-specific receipt, item-claiming, QR, allocation, balance, and settlement experiences.

## 2. Reference Images

### `design/screens/acorns-splash-reference.png`

Use for:
- Launch-screen color blocking.
- Centered Divi mark placement.
- Minimal brand moments with no competing content.

Do not reuse the acorn mark. Replace it with a future Divi logo or a simple approved Divi wordmark/brand asset.

### `design/screens/acorns-form-cta-reference.png`

Use for:
- Receipt confirmation.
- Join Divi details.
- Settlement entry.
- Profile and settings forms.
- Any focused, single-purpose flow with a persistent primary action.

Key patterns:
- Large whitespace above the primary content.
- Bold centered title with a quieter explanatory paragraph.
- Edge-to-edge content rows with thin separators.
- Strong left labels and right-aligned values/actions.
- A wide green pill CTA anchored near the safe-area bottom.
- Sparse use of badges and secondary metadata.

### `design/screens/acorns-dashboard-navigation-reference.png`

Use for:
- Home and history screens.
- Item-claiming lists.
- Participant allocation and settlement lists.
- The global bottom navigation structure.

Key patterns:
- Large section heading followed by one dominant summary region.
- Strong row titles, quieter secondary labels, and trailing values.
- Color markers used as supplements rather than the sole status signal.
- Thin low-contrast dividers instead of enclosing every item in a card.
- A five-position bottom bar with a visually elevated center action.

For Divi, the center action is **Create Divi**. It should be a filled near-black circular button with a clear receipt-plus or split-plus symbol and an always-visible text label. The surrounding tabs are:

1. Home
2. Receipts
3. Create Divi
4. Activity
5. Profile

### `design/screens/acorns-hero-actions-reference.png`

Use for:
- A Divi detail header.
- Creator claiming progress.
- Finalized and settlement summaries.
- QR invitation presentation where a high-emphasis panel is useful.

Key patterns:
- Large green hero region with white title and monetary/status text.
- One dominant number or state.
- A short row of circular near-black quick actions immediately below the hero.
- Quiet settings/detail rows below the action cluster.
- Hard separation between the hero and white content surface; do not add unnecessary cards.

Replace financial charts with product-relevant visual structures such as:
- A QR code framed by generous quiet space.
- A receipt allocation progress indicator.
- Claimed versus unclaimed item status.
- Amount owed or amount due back.
- Participant repayment progress.

## 3. Color System

Use semantic tokens throughout the application. Initial light-mode values may begin with the following and should be tuned during implementation for WCAG contrast:

| Token | Initial value | Usage |
| --- | --- | --- |
| `brandPrimary` | `#70CF45` | Primary CTAs, brand surfaces, selected positive emphasis |
| `brandPrimaryPressed` | `#58B936` | Pressed primary controls |
| `brandPrimarySoft` | `#EFFAE9` | Subtle green badges and backgrounds |
| `brandDeep` | `#2F8515` | Accessible green text or secondary green emphasis |
| `surfacePrimary` | `#FFFFFF` | Main screen background |
| `surfaceSecondary` | `#F6F7F5` | Grouped background and quiet containers |
| `inkPrimary` | `#111111` | Headings, key values, primary icons |
| `inkSecondary` | `#656565` | Supporting copy and metadata |
| `inkTertiary` | `#A7A7A7` | Inactive navigation and nonessential hints |
| `separator` | `#EAECEA` | Hairline row separators |
| `negative` | `#C73B3B` | Amounts owed, destructive actions, errors |
| `warning` | `#A86100` | Reconciliation and unclaimed-item warnings |

Rules:
- Green communicates brand, progress, confirmation, or money owed back to the user.
- Red is reserved for destructive actions, errors, and amounts the user owes; never use it decoratively.
- Near-black provides contrast and anchors navigation/action controls.
- White space is a primary design element, not unused space.
- Never communicate Claiming, Finalized, Paid, or error states through color alone. Pair color with text, iconography, and/or shape.
- Verify text contrast in both light and dark appearances. Dark mode may use adapted semantic values rather than literal inversions.

## 4. Typography

Use the iOS system font through React Native text styles and respect dynamic text sizing. Match the references' confident, rounded system typography without bundling a lookalike font.

Recommended hierarchy:

| Role | React Native baseline | Weight | Typical use |
| --- | --- | --- | --- |
| Display amount | 44–52 pt scalable | Regular/Medium | Final amount, amount owed, total receipt |
| Screen title | 32–36 pt scalable | Bold | Home, Divi title, major sections |
| Section title | 24–28 pt scalable | Bold | Receipt items, participants, settlement |
| Row title | 17–20 pt scalable | Semibold/Bold | Item names and primary row labels |
| Body | 17 pt scalable | Regular | Explanations and form values |
| Supporting | 14–15 pt scalable | Regular/Medium | Metadata and secondary labels |
| Caption | 12–13 pt scalable | Semibold | Badges and compact status labels |

Rules:
- Use sentence case.
- Prefer short headings and concise supporting copy.
- Keep financial amounts tabular or monospaced-digit where alignment benefits comprehension.
- Permit text wrapping before truncating financial explanations or participant names.
- Test every screen at accessibility text sizes; layouts may stack vertically rather than compress.

## 5. Spacing and Layout

Use an 8-point spacing system with 4-point increments for fine adjustments.

Core values:
- Horizontal screen inset: 24 pt; 20 pt on compact layouts when needed.
- Major section gap: 32–40 pt.
- Related content gap: 16–24 pt.
- Row vertical padding: 18–22 pt.
- Label-to-supporting-text gap: 4–8 pt.
- Divider inset: align with the leading text column rather than icons when appropriate.
- Bottom content inset: include the tab bar and safe area.

Hierarchy rules:
- Each screen should have one unmistakable primary purpose.
- Prefer one dominant summary followed by ordered details.
- Avoid nested card stacks. Use open white layouts, separators, and occasional soft backgrounds.
- Keep high-value amounts and state labels above supporting metadata.
- Centered layouts are appropriate for onboarding, empty states, QR invitations, completion, and processing. Operational lists should remain leading-aligned.

## 6. Shape, Controls, and Surfaces

### Corner radii

- Primary pill button: height 56–60 pt; radius equal to half the height.
- Circular quick action: 64–72 pt diameter.
- Badges/chips: 24–36 pt height with full pill radius.
- Image or receipt preview: 20–24 pt radius.
- Sheets and larger grouped surfaces: 24–28 pt top radius.
- Smaller controls: 12–16 pt radius.

### Buttons

Primary:
- Brand green fill.
- White or contrast-verified near-black label.
- Full-width pill shape.
- Semibold 17–18 pt label.

Secondary:
- Near-black fill with white content for compact high-emphasis actions.
- Alternatively, a white/clear surface with a near-black label and visible border when the hierarchy requires less emphasis.

Destructive:
- Prefer text or outlined presentation until final confirmation.
- Use red only at the point of destructive intent.

All interactive controls require a minimum 44 × 44 pt hit target, visible pressed/disabled states, and VoiceOver labels.

### Rows

- Prefer open rows on white with subtle separators.
- Use a leading icon, avatar, or 6–10 pt color marker only when it improves scanning.
- Place the primary label leading and the most important value/status trailing.
- Supporting copy sits below the primary label in `inkSecondary`.
- Chevron indicates navigation, never selection or completion.

## 7. Navigation

### Bottom navigation

Use five persistent positions for authenticated full-app screens:

- Home
- Receipts
- Create Divi
- Activity
- Profile

The **Create Divi** action is centered, elevated above the bar, and visually dominant. It must remain recognizable as an action, not appear to be a selected tab. Its label remains visible beneath the button.

Use filled or higher-contrast icon treatment for the selected tab and quiet gray for inactive tabs. Preserve iOS safe-area behavior and keep the bar background opaque enough to separate navigation from scrolling content.

The App Clip does not use this global navigation. It opens directly into join, claim, and final-summary screens for the invoked Divi.

### Screen chrome

- Use standard back and close affordances with generous hit areas.
- Center compact context titles only when it improves orientation.
- Keep toolbar actions sparse; move secondary actions into menus or the page body.

## 8. Screen-by-Screen Application

### Launch and onboarding

Primary reference: `acorns-splash-reference.png`.

- Use a full `brandPrimary` surface with a centered Divi brand mark.
- Transition to a white onboarding/authentication screen with a bold value proposition and generous spacing.
- Authentication buttons should be platform-compliant and visually separated from Divi's primary green CTA.

### Home

Primary references: `acorns-dashboard-navigation-reference.png` and `acorns-hero-actions-reference.png`.

- Lead with a concise greeting or screen title and one financial/action summary.
- Prioritize “You owe,” “You are owed,” and active Divis over aggregate bookkeeping.
- Show Draft/Claiming/Finalized Divis as open list rows with strong titles, status labels, participant metadata, and trailing amounts.
- Use the centered Create Divi action in the global tab bar.
- Do not add a portfolio chart. A compact balance/claim summary or active-Divi progress treatment should occupy the dominant summary region.

### Receipt capture

Primary reference: `acorns-form-cta-reference.png`.

- Use a large rounded camera preview or receipt frame.
- Keep capture, Photos, and manual-entry actions visually obvious and separated.
- Anchor the confirmation CTA at the bottom when a valid image is available.

### Receipt processing

Primary references: `acorns-splash-reference.png` and `acorns-form-cta-reference.png`.

- Use a focused, low-distraction state with a receipt preview and clear progress copy.
- Avoid indefinite animation without status. Provide retry and manual-entry paths after a reasonable timeout.

### Receipt confirmation

Primary references: `acorns-form-cta-reference.png` and `acorns-dashboard-navigation-reference.png`.

- Use open list rows for line items and grouped receipt totals.
- Keep editable values trailing and use subtle separators.
- Show the calculated-versus-entered total discrepancy in a high-contrast warning block.
- Anchor **Begin Claiming** as the full-width pill CTA.

### QR invitation

Primary references: `acorns-hero-actions-reference.png` and `acorns-form-cta-reference.png`.

- Place the QR code as the dominant centered object with sufficient white quiet zone.
- Use a green hero or header for Divi identity and participant count, but never place the QR code itself on a low-contrast or patterned surface.
- Place circular near-black actions for Share Link and Regenerate/Revoke when appropriate.

### Join Divi

Primary reference: `acorns-form-cta-reference.png`.

- Center merchant/Divi identity and a concise receipt summary.
- Use simple rows for creator, total, and participants.
- Anchor **Join Divi** as the green pill CTA.
- Keep the App Clip path free of global navigation and unrelated account setup.

### Item claiming

Primary reference: `acorns-dashboard-navigation-reference.png`.

- Present receipt items as open rows with price, quantity, and claimant indicators.
- Use a strong trailing claim affordance and an explicit claimed/unclaimed label.
- Keep the participant's provisional total visible in a sticky summary or stable header.
- Shared claims should show recognizable avatars/initials plus accessible claimant text.
- Unclaimed items use warning text and iconography, not color alone.

### Creator claiming dashboard

Primary reference: `acorns-hero-actions-reference.png`.

- Use the green hero for claimed progress, unallocated amount, and readiness state.
- Replace the line chart with a simple accessible progress treatment.
- Use circular quick actions for Invite, Review Items, and Finalize when valid.
- Show unresolved items as open rows below the hero.

### Final review and participant summary

Primary references: `acorns-dashboard-navigation-reference.png` and `acorns-form-cta-reference.png`.

- Make the final amount the dominant typographic element.
- Show item, tax, tip, fee, and discount components as clean rows.
- Clearly label the total as Finalized rather than provisional.
- For balances owed to the current user, use a full-width **Request with Venmo** CTA when available.
- Show recipient, exact amount, and Divi-derived note in a compact review/fallback treatment before handoff when useful.
- Present **Request initiated** as a neutral handoff status, visually distinct from **Paid**.
- Provide copy actions for any value Venmo cannot pre-populate and retain **Record Payment** as a separate settlement action.

### Creator settlement summary

Primary reference: `acorns-hero-actions-reference.png`.

- Use the hero for total outstanding reimbursement and Divi state.
- Show participant obligations as rows with trailing amounts and textual statuses.
- Use circular actions only for the most common tasks, such as Share Request and Record Payment.

### History, activity, and settings

Primary references: `acorns-dashboard-navigation-reference.png` and `acorns-form-cta-reference.png`.

- Use list-first layouts with strong row hierarchy and thin separators.
- Keep destructive account actions separated from ordinary settings.
- Avoid decorative summary graphics where a clear list is more useful.

## 9. Icons and Imagery

- Use SF Symbols or a single coherent licensed icon family.
- Prefer simple rounded-line symbols with consistent stroke weight.
- Never use emoji as production interface icons.
- Do not extract or recreate Acorns' logo or illustrations.
- Divi-specific illustration may be generated later for onboarding or empty states, but the MVP can succeed with typography, receipt imagery, QR codes, avatars, and native symbols.
- Receipt images are content and should preserve aspect ratio, allow zoom where needed, and never be stretched.

## 10. Motion and Feedback

- Keep motion short, functional, and interruptible.
- Use subtle spring or ease-out transitions for claiming/unclaiming, expanding rows, and state changes.
- Respect Reduce Motion by replacing spatial movement with opacity or immediate state changes.
- Use haptics sparingly for successful capture, claim changes, finalization, and settlement recording.
- Never rely on a transient animation as the only confirmation of a financial action.

## 11. Accessibility and Content Rules

- Support Dynamic Type, VoiceOver, sufficient contrast, and 44 × 44 pt targets.
- Provide accessibility values for monetary amounts, claim state, participant count, and repayment status.
- Give QR screens an alternate share-link action and descriptive instructions.
- Avoid placing important text over receipt photography.
- Format currency using locale-aware formatters while preserving the Divi's currency code where ambiguity exists.
- Use direct labels: **You owe Maya $24.18**, **Maya owes you $24.18**, **3 items unclaimed**.
- Distinguish provisional and finalized numbers in both copy and appearance.

## 12. Implementation Guardrails

- Build all values from semantic tokens so visual tuning does not require feature rewrites.
- Create reusable primitives for primary pill buttons, list rows, monetary amounts, status pills, circular quick actions, participant stacks, section headers, and bottom navigation.
- Keep domain state out of visual tokens and components.
- Validate the design on at least one compact and one large iPhone, in light/dark appearance, and at an accessibility Dynamic Type size.
- When a reference conflicts with native iOS behavior, accessibility, or Divi's financial clarity, preserve the design principle rather than the literal arrangement.
