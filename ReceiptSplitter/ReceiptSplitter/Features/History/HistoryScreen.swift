import SwiftUI

struct HistoryScreen: View {
    @Environment(\.appEnvironment) private var environment
    @StateObject var viewModel: HistoryViewModel

    var body: some View {
        List {
            if viewModel.isLoading {
                ProgressView()
            }

            ForEach(viewModel.sessions) { session in
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text(session.receipt.merchantName)
                        .font(.body.weight(.medium))
                    Text("\(session.participants.count) participants - \(CurrencyFormatter.string(from: session.receipt.totals.total))")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.Color.muted)
                }
                .padding(.vertical, AppTheme.Spacing.xs)
            }
        }
        .navigationTitle("Past Splits")
        .task {
            await viewModel.load(using: environment.historyService)
        }
    }
}
