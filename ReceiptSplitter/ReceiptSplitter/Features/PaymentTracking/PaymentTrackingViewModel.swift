import Combine
import Foundation

@MainActor
final class PaymentTrackingViewModel: ObservableObject {
    @Published var session: SplitSession

    init(session: SplitSession) {
        self.session = session
    }

    func amountOwed(for participant: Participant) -> Decimal {
        let claimed = session.claimedItems.filter { $0.participantID == participant.id }
        let subtotal = claimed.reduce(Decimal.zero) { total, claim in
            guard let item = session.receipt.items.first(where: { $0.id == claim.receiptItemID }) else {
                return total
            }
            return total + (item.subtotal * claim.shareFraction)
        }

        guard session.receipt.totals.subtotal > 0 else { return subtotal }
        let proportionalFees = subtotal / session.receipt.totals.subtotal * (session.receipt.totals.tax + session.receipt.totals.tip)
        return subtotal + proportionalFees
    }
}
