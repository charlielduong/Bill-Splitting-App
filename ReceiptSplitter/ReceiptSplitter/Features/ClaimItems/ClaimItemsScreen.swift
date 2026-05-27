import SwiftUI

struct ClaimItemsScreen: View {
    @StateObject var viewModel: ClaimItemsViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text(viewModel.session.receipt.merchantName)
                        .font(.title2.weight(.bold))
                    Text("Select the items you want to claim.")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.Color.muted)
                }

                TextField("Your name", text: $viewModel.guestName)
                    .textFieldStyle(.roundedBorder)

                VStack(spacing: 0) {
                    ForEach(viewModel.session.receipt.items) { item in
                        Button {
                            viewModel.toggleSelection(for: item)
                        } label: {
                            HStack {
                                ReceiptItemRow(item: item)
                                Image(systemName: viewModel.selectedItemIDs.contains(item.id) ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(AppTheme.Color.primary)
                            }
                        }
                        .buttonStyle(.plain)
                        Divider()
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .background(AppTheme.Color.surface)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.md))

                PrimaryButton(title: "Confirm Claim") {
                    viewModel.confirmClaim()
                }
                .disabled(viewModel.selectedItemIDs.isEmpty || viewModel.guestName.isEmpty)
            }
            .padding(AppTheme.Spacing.lg)
        }
        .background(AppTheme.Color.background)
        .navigationTitle("Claim Items")
    }
}
