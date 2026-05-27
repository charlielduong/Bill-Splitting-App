import SwiftUI

struct ReceiptReviewScreen: View {
    @Environment(\.appEnvironment) private var environment
    @EnvironmentObject private var router: AppRouter
    @StateObject var viewModel: ReceiptReviewViewModel
    @State private var isCreatingSession = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text(viewModel.receipt.merchantName)
                        .font(.title2.weight(.bold))
                    Text("Confirm extracted receipt items before sharing.")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.Color.muted)
                }

                VStack(spacing: 0) {
                    ForEach($viewModel.receipt.items) { $item in
                        EditableReceiptItemRow(item: $item) {
                            viewModel.updateItem(item)
                        }
                        Divider()
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .background(AppTheme.Color.surface)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.md))

                TotalSummaryCard(totals: viewModel.receipt.totals)

                PrimaryButton(title: isCreatingSession ? "Creating..." : "Continue to Split Session") {
                    Task {
                        isCreatingSession = true
                        defer { isCreatingSession = false }
                        let session = try? await environment.splitSessionService.createSession(for: viewModel.receipt)
                        if let session {
                            router.navigate(to: .splitSession(session))
                        }
                    }
                }
                .disabled(isCreatingSession)
            }
            .padding(AppTheme.Spacing.lg)
        }
        .background(AppTheme.Color.background)
        .navigationTitle("Review Receipt")
    }
}

private struct EditableReceiptItemRow: View {
    @Binding var item: ReceiptItem
    let onCommit: () -> Void
    @State private var unitPriceText: String

    init(item: Binding<ReceiptItem>, onCommit: @escaping () -> Void) {
        self._item = item
        self.onCommit = onCommit
        self._unitPriceText = State(initialValue: "\(item.wrappedValue.unitPrice)")
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            TextField("Item name", text: $item.name)
                .font(.body.weight(.medium))
                .onSubmit(onCommit)

            HStack {
                Stepper("Qty \(item.quantity)", value: $item.quantity, in: 1...20)
                    .onChange(of: item.quantity) { _, _ in onCommit() }

                Spacer()

                Text(CurrencyFormatter.string(from: item.subtotal))
                    .font(.body.weight(.semibold))
            }

            HStack {
                Text("Unit price")
                    .font(.caption)
                    .foregroundStyle(AppTheme.Color.muted)
                TextField("0.00", text: $unitPriceText)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .onChange(of: unitPriceText) { _, newValue in
                        guard let decimal = Decimal(string: newValue) else { return }
                        item.unitPrice = decimal
                        onCommit()
                    }
            }
            .font(.subheadline)
        }
        .padding(.vertical, AppTheme.Spacing.md)
    }
}
