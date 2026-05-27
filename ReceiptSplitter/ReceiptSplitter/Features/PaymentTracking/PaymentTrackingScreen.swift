import SwiftUI

struct PaymentTrackingScreen: View {
    @StateObject var viewModel: PaymentTrackingViewModel

    var body: some View {
        List {
            Section("Participants") {
                ForEach(viewModel.session.participants) { participant in
                    HStack {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                            Text(participant.displayName)
                                .font(.body.weight(.medium))
                            Text(CurrencyFormatter.string(from: viewModel.amountOwed(for: participant)))
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.Color.muted)
                        }
                        Spacer()
                        StatusBadge(status: participant.paymentStatus)
                    }
                }
            }
        }
        .navigationTitle("Payment Tracking")
    }
}
