import SwiftUI

struct HomeScreen: View {
    @EnvironmentObject private var router: AppRouter

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                    Text("Receipt Splitter")
                        .font(.largeTitle.weight(.bold))
                    Text("Capture a receipt, confirm the items, and invite others to claim what they had.")
                        .font(.body)
                        .foregroundStyle(AppTheme.Color.muted)
                }

                VStack(spacing: AppTheme.Spacing.md) {
                    PrimaryButton(title: "Start New Receipt Split") {
                        router.navigate(to: .receiptCapture)
                    }

                    SecondaryButton(title: "View Past Splits") {
                        router.navigate(to: .history)
                    }
                }
            }
            .padding(AppTheme.Spacing.lg)
        }
        .background(AppTheme.Color.background)
        .navigationTitle("Home")
    }
}
