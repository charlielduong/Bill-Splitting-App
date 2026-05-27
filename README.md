# Receipt Splitter iOS Scaffold

Initial SwiftUI frontend scaffold for an iOS receipt-splitting app. This is intentionally not a full product implementation: OCR, AWS, real-time networking, payment processing, and production persistence are represented by async protocols and mock services.

## Structure

```text
ReceiptSplitter/
  App/                  App entry point, router, dependency environment
  Core/
    Models/             Receipt, item, participant, split session, claims, payment status
    Services/           Async service protocols and mock implementations
    Networking/         Placeholder API client boundary for future AWS integration
    Utilities/          Shared helpers such as currency formatting and layout utilities
    DesignSystem/       Theme tokens and reusable UI components
  Features/
    Onboarding/         Home screen
    ReceiptCapture/     Camera/photo picker placeholder and mock receipt loading
    ReceiptReview/      Editable extracted receipt item review
    SplitSession/       Participant and assignment placeholder flow
    QRShare/            Placeholder QR/share link flow
    ClaimItems/         Guest-facing claim placeholder
    PaymentTracking/    Participant balances and paid/unpaid state
    History/            Past split list
  Resources/
    Assets.xcassets/    Image and color assets placeholder
    MockData/           Restaurant receipt sample data
  Tests/                Initial unit test placeholder
```

## Architecture

- SwiftUI with a small MVVM layer per feature.
- `AppRouter` owns navigation routes and keeps screens decoupled from destination construction.
- `AppEnvironment` injects service protocols through SwiftUI environment values.
- Core services are `async/await` ready so mock services can be replaced by AWS-backed implementations later.
- Domain models are plain Swift value types to keep state predictable and testable.
- Shared visual primitives live in `Core/DesignSystem` so feature screens avoid one-off styling.

## Current Flow

1. `HomeScreen` starts a new split or opens history.
2. `ReceiptCaptureScreen` shows a camera/photo picker placeholder and can load a mock receipt.
3. `ReceiptReviewScreen` displays merchant info, editable item rows, and totals.
4. `SplitSessionScreen` shows participants, item assignment placeholders, and links to QR/payment screens.
5. `QRShareScreen` displays a placeholder QR area and generated mock share URL.
6. `ClaimItemsScreen` sketches the guest item-claiming experience.
7. `PaymentTrackingScreen` lists participants with owed amounts and payment status.
8. `HistoryScreen` loads mock past splits.

## Next Development Steps

1. Create an Xcode project or target and add the `ReceiptSplitter/` source tree to the app target.
2. Replace capture placeholder with camera/photo picker integration.
3. Define API contracts for receipt parsing, split sessions, participants, claims, payments, and history.
4. Implement AWS-backed services behind the existing service protocols.
5. Add focused unit tests for totals, assignment math, claim rules, and view model state transitions.
