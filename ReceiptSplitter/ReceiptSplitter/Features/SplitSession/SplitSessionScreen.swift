import SwiftUI

struct SplitSessionScreen: View {
    @Environment(\.appEnvironment) private var environment
    @EnvironmentObject private var router: AppRouter
    @StateObject var viewModel: SplitSessionViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                participantSection
                itemAssignmentSection

                VStack(spacing: AppTheme.Spacing.md) {
                    PrimaryButton(title: "Generate QR / Share Link") {
                        router.navigate(to: .qrShare(viewModel.session))
                    }

                    SecondaryButton(title: "Track Payments") {
                        router.navigate(to: .paymentTracking(viewModel.session))
                    }
                }
            }
            .padding(AppTheme.Spacing.lg)
        }
        .background(AppTheme.Color.background)
        .navigationTitle("Split Session")
    }

    private var participantSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            Text("Participants")
                .font(.headline)

            FlowLayout(spacing: AppTheme.Spacing.sm) {
                ForEach(viewModel.session.participants) { participant in
                    ParticipantChip(participant: participant)
                }
            }

            HStack {
                TextField("Add participant", text: $viewModel.newParticipantName)
                    .textFieldStyle(.roundedBorder)
                Button("Add") {
                    Task {
                        await viewModel.addParticipant(using: environment.splitSessionService)
                    }
                }
            }
        }
    }

    private var itemAssignmentSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            Text("Items")
                .font(.headline)

            VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                ForEach(viewModel.session.receipt.items) { item in
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                        ReceiptItemRow(item: item, trailingText: viewModel.assignedNames(for: item))

                        FlowLayout(spacing: AppTheme.Spacing.sm) {
                            ForEach(viewModel.session.participants) { participant in
                                Button {
                                    viewModel.toggleAssignment(item: item, participant: participant)
                                } label: {
                                    Text(participant.displayName)
                                        .font(.caption.weight(.semibold))
                                        .padding(.horizontal, AppTheme.Spacing.sm)
                                        .padding(.vertical, AppTheme.Spacing.xs)
                                        .background(viewModel.isAssigned(item: item, to: participant) ? AppTheme.Color.primary : AppTheme.Color.background)
                                        .foregroundStyle(viewModel.isAssigned(item: item, to: participant) ? .white : AppTheme.Color.secondary)
                                        .clipShape(Capsule())
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    Divider()
                }
            }
            .padding(AppTheme.Spacing.md)
            .background(AppTheme.Color.surface)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.md))
        }
    }
}
