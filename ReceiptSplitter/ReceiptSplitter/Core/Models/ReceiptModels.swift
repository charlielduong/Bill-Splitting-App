import Foundation

struct Receipt: Identifiable, Hashable {
    let id: UUID
    var merchantName: String
    var date: Date
    var items: [ReceiptItem]
    var totals: ReceiptTotals

    init(
        id: UUID = UUID(),
        merchantName: String,
        date: Date = Date(),
        items: [ReceiptItem],
        totals: ReceiptTotals
    ) {
        self.id = id
        self.merchantName = merchantName
        self.date = date
        self.items = items
        self.totals = totals
    }
}

struct ReceiptItem: Identifiable, Hashable {
    let id: UUID
    var name: String
    var quantity: Int
    var unitPrice: Decimal

    var subtotal: Decimal {
        Decimal(quantity) * unitPrice
    }

    init(id: UUID = UUID(), name: String, quantity: Int, unitPrice: Decimal) {
        self.id = id
        self.name = name
        self.quantity = quantity
        self.unitPrice = unitPrice
    }
}

struct ReceiptTotals: Hashable {
    var subtotal: Decimal
    var tax: Decimal
    var tip: Decimal
    var total: Decimal
}

struct ReceiptParseResult: Hashable {
    var receipt: Receipt
    var confidence: Double
    var warnings: [String]
}

struct Participant: Identifiable, Hashable {
    let id: UUID
    var displayName: String
    var paymentStatus: PaymentStatus

    init(id: UUID = UUID(), displayName: String, paymentStatus: PaymentStatus = .unpaid) {
        self.id = id
        self.displayName = displayName
        self.paymentStatus = paymentStatus
    }
}

struct SplitSession: Identifiable, Hashable {
    let id: UUID
    var receipt: Receipt
    var participants: [Participant]
    var claimedItems: [ClaimedItem]
    var shareURL: URL?
    var createdAt: Date

    init(
        id: UUID = UUID(),
        receipt: Receipt,
        participants: [Participant] = [],
        claimedItems: [ClaimedItem] = [],
        shareURL: URL? = nil,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.receipt = receipt
        self.participants = participants
        self.claimedItems = claimedItems
        self.shareURL = shareURL
        self.createdAt = createdAt
    }
}

struct ClaimedItem: Identifiable, Hashable {
    let id: UUID
    var receiptItemID: UUID
    var participantID: UUID
    var shareFraction: Decimal

    init(id: UUID = UUID(), receiptItemID: UUID, participantID: UUID, shareFraction: Decimal = 1) {
        self.id = id
        self.receiptItemID = receiptItemID
        self.participantID = participantID
        self.shareFraction = shareFraction
    }
}

enum PaymentStatus: String, CaseIterable, Hashable {
    case unpaid = "Unpaid"
    case pending = "Pending"
    case paid = "Paid"
}
