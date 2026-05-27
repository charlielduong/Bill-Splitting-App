import SwiftUI

struct PrimaryButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppTheme.Spacing.md)
        }
        .buttonStyle(.plain)
        .foregroundStyle(.white)
        .background(AppTheme.Color.primary)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.sm))
    }
}

struct SecondaryButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppTheme.Spacing.md)
        }
        .buttonStyle(.plain)
        .foregroundStyle(AppTheme.Color.primary)
        .background(AppTheme.Color.surface)
        .overlay {
            RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                .stroke(AppTheme.Color.primary.opacity(0.25), lineWidth: 1)
        }
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.sm))
    }
}

struct ReceiptItemRow: View {
    let item: ReceiptItem
    var trailingText: String?

    var body: some View {
        HStack(alignment: .top, spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text(item.name)
                    .font(.body.weight(.medium))
                Text("Qty \(item.quantity) x \(CurrencyFormatter.string(from: item.unitPrice))")
                    .font(.caption)
                    .foregroundStyle(AppTheme.Color.muted)
            }

            Spacer()

            Text(trailingText ?? CurrencyFormatter.string(from: item.subtotal))
                .font(.body.weight(.semibold))
        }
        .padding(.vertical, AppTheme.Spacing.sm)
    }
}

struct ParticipantChip: View {
    let participant: Participant

    var body: some View {
        Text(participant.displayName)
            .font(.subheadline.weight(.medium))
            .padding(.horizontal, AppTheme.Spacing.md)
            .padding(.vertical, AppTheme.Spacing.sm)
            .background(AppTheme.Color.primary.opacity(0.10))
            .foregroundStyle(AppTheme.Color.primary)
            .clipShape(Capsule())
    }
}

struct StatusBadge: View {
    let status: PaymentStatus

    var body: some View {
        Text(status.rawValue)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, AppTheme.Spacing.sm)
            .padding(.vertical, AppTheme.Spacing.xs)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }

    private var color: Color {
        switch status {
        case .paid:
            AppTheme.Color.success
        case .pending:
            AppTheme.Color.warning
        case .unpaid:
            AppTheme.Color.muted
        }
    }
}

struct TotalSummaryCard: View {
    let totals: ReceiptTotals

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            amountRow("Subtotal", totals.subtotal)
            amountRow("Tax", totals.tax)
            amountRow("Tip", totals.tip)
            Divider()
            amountRow("Total", totals.total, isEmphasized: true)
        }
        .padding(AppTheme.Spacing.md)
        .background(AppTheme.Color.surface)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.md))
    }

    private func amountRow(_ label: String, _ amount: Decimal, isEmphasized: Bool = false) -> some View {
        HStack {
            Text(label)
            Spacer()
            Text(CurrencyFormatter.string(from: amount))
        }
        .font(isEmphasized ? .headline : .subheadline)
    }
}
