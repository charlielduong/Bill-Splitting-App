import SwiftUI

struct ReceiptCaptureScreen: View {
    @Environment(\.appEnvironment) private var environment
    @EnvironmentObject private var router: AppRouter
    @StateObject var viewModel: ReceiptCaptureViewModel

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            RoundedRectangle(cornerRadius: AppTheme.Radius.md)
                .fill(AppTheme.Color.surface)
                .overlay {
                    VStack(spacing: AppTheme.Spacing.md) {
                        Image(systemName: "camera.viewfinder")
                            .font(.system(size: 44))
                            .foregroundStyle(AppTheme.Color.primary)
                        Text("Camera and photo picker placeholder")
                            .font(.headline)
                        Text("OCR will start after a receipt image is captured or selected.")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.Color.muted)
                            .multilineTextAlignment(.center)
                    }
                    .padding(AppTheme.Spacing.lg)
                }
                .frame(height: 320)

            PrimaryButton(title: viewModel.isLoading ? "Loading..." : "Use Mock Receipt") {
                Task {
                    guard let receipt = await viewModel.loadMockReceipt(using: environment.receiptParsingService) else {
                        return
                    }
                    router.navigate(to: .receiptReview(receipt))
                }
            }
            .disabled(viewModel.isLoading)

            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .font(.footnote)
                    .foregroundStyle(.red)
            }

            Spacer()
        }
        .padding(AppTheme.Spacing.lg)
        .background(AppTheme.Color.background)
        .navigationTitle("Capture Receipt")
    }
}
