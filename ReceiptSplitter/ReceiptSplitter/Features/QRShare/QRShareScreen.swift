import SwiftUI

struct QRShareScreen: View {
    @Environment(\.appEnvironment) private var environment
    @EnvironmentObject private var router: AppRouter
    @StateObject var viewModel: QRShareViewModel
    @State private var isGenerating = false

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            RoundedRectangle(cornerRadius: AppTheme.Radius.md)
                .fill(AppTheme.Color.surface)
                .overlay {
                    VStack(spacing: AppTheme.Spacing.md) {
                        Image(systemName: "qrcode")
                            .font(.system(size: 96))
                            .foregroundStyle(AppTheme.Color.secondary)
                        Text("QR code placeholder")
                            .font(.headline)
                    }
                }
                .frame(width: 260, height: 260)

            VStack(spacing: AppTheme.Spacing.sm) {
                Text(viewModel.shareLinkText)
                    .font(.footnote.monospaced())
                    .multilineTextAlignment(.center)
                Text("Guests can open this split in a browser or through the iOS app deep link.")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.Color.muted)
                    .multilineTextAlignment(.center)
            }

            PrimaryButton(title: isGenerating ? "Generating..." : "Generate Share Link") {
                Task {
                    isGenerating = true
                    defer { isGenerating = false }
                    if let url = try? await environment.splitSessionService.generateShareLink(for: viewModel.session) {
                        viewModel.session.shareURL = url
                    }
                }
            }

            SecondaryButton(title: "Preview Guest Claim Flow") {
                router.navigate(to: .claimItems(viewModel.session))
            }

            Spacer()
        }
        .padding(AppTheme.Spacing.lg)
        .background(AppTheme.Color.background)
        .navigationTitle("Share Split")
    }
}
