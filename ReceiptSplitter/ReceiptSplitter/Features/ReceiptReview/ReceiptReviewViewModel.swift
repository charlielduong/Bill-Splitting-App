import Combine
import Foundation

@MainActor
final class ReceiptReviewViewModel: ObservableObject {
    @Published var receipt: Receipt

    init(receipt: Receipt) {
        self.receipt = receipt
    }

    func updateItem(_ item: ReceiptItem) {
        guard let index = receipt.items.firstIndex(where: { $0.id == item.id }) else {
            return
        }
        receipt.items[index] = item
        recalculateSubtotal()
    }

    private func recalculateSubtotal() {
        let subtotal = receipt.items.reduce(Decimal.zero) { $0 + $1.subtotal }
        receipt.totals.subtotal = subtotal
        receipt.totals.total = subtotal + receipt.totals.tax + receipt.totals.tip
    }
}
