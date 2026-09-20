import Foundation

struct Money: Hashable, Codable, Sendable {
    var minorUnits: Int
    var currencyCode: String

    init(_ minorUnits: Int, currencyCode: String = "USD") {
        self.minorUnits = minorUnits
        self.currencyCode = currencyCode
    }

    var formatted: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currencyCode
        return formatter.string(from: NSNumber(value: Double(minorUnits) / 100)) ?? "\(currencyCode) \(minorUnits)"
    }
}

struct Participant: Identifiable, Hashable, Codable, Sendable {
    let id: UUID
    var name: String
    var venmoUsername: String?
    var isCurrentUser: Bool

    init(id: UUID = UUID(), name: String, venmoUsername: String? = nil, isCurrentUser: Bool = false) {
        self.id = id
        self.name = name
        self.venmoUsername = venmoUsername
        self.isCurrentUser = isCurrentUser
    }
}

struct ReceiptItem: Identifiable, Hashable, Codable, Sendable {
    let id: UUID
    var name: String
    var amount: Money
    var claimantIDs: Set<UUID>

    init(id: UUID = UUID(), name: String, amount: Money, claimantIDs: Set<UUID> = []) {
        self.id = id
        self.name = name
        self.amount = amount
        self.claimantIDs = claimantIDs
    }
}

enum DiviState: String, Codable, CaseIterable, Sendable {
    case draft = "Draft"
    case claiming = "Claiming"
    case finalized = "Finalized"
    case settled = "Settled"
}

enum PaymentStatus: String, Codable, Sendable {
    case outstanding = "Outstanding"
    case partiallyPaid = "Partially paid"
    case paid = "Paid"
}

struct Allocation: Identifiable, Hashable, Codable, Sendable {
    var id: UUID { participantID }
    let participantID: UUID
    var items: Money
    var tax: Money
    var tip: Money
    var fees: Money
    var discounts: Money
    var total: Money
    var paid: Money
    var requestInitiated: Bool

    var status: PaymentStatus {
        if paid.minorUnits <= 0 { return .outstanding }
        if paid.minorUnits < total.minorUnits { return .partiallyPaid }
        return .paid
    }

    var outstanding: Money { Money(max(0, total.minorUnits - paid.minorUnits), currencyCode: total.currencyCode) }
}

struct Divi: Identifiable, Hashable, Codable, Sendable {
    let id: UUID
    var title: String
    var date: Date
    var state: DiviState
    var creatorID: UUID
    var payerID: UUID
    var participants: [Participant]
    var items: [ReceiptItem]
    var tax: Money
    var tip: Money
    var fees: Money
    var discounts: Money
    var enteredTotal: Money
    var allocations: [Allocation]

    var currencyCode: String { enteredTotal.currencyCode }
    var itemSubtotal: Money { Money(items.reduce(0) { $0 + $1.amount.minorUnits }, currencyCode: currencyCode) }
    var calculatedTotal: Money { Money(itemSubtotal.minorUnits + tax.minorUnits + tip.minorUnits + fees.minorUnits - discounts.minorUnits, currencyCode: currencyCode) }
    var isReconciled: Bool { calculatedTotal.minorUnits == enteredTotal.minorUnits }
    var unclaimedCount: Int { items.filter(\.claimantIDs.isEmpty).count }

    init(id: UUID = UUID(), title: String, date: Date = .now, state: DiviState = .draft, creatorID: UUID, payerID: UUID, participants: [Participant], items: [ReceiptItem], tax: Money = Money(0), tip: Money = Money(0), fees: Money = Money(0), discounts: Money = Money(0), enteredTotal: Money, allocations: [Allocation] = []) {
        self.id = id; self.title = title; self.date = date; self.state = state
        self.creatorID = creatorID; self.payerID = payerID; self.participants = participants; self.items = items
        self.tax = tax; self.tip = tip; self.fees = fees; self.discounts = discounts
        self.enteredTotal = enteredTotal; self.allocations = allocations
    }
}

enum SampleData {
    static let me = Participant(name: "Charlie", venmoUsername: "charlie", isCurrentUser: true)
    static let alex = Participant(name: "Alex", venmoUsername: "alex")
    static let sam = Participant(name: "Sam")

    static func dinner(state: DiviState = .claiming) -> Divi {
        let people = [me, alex, sam]
        return Divi(
            title: "Dinner at Barcelona", state: state, creatorID: me.id, payerID: me.id,
            participants: people,
            items: [
                ReceiptItem(name: "Patatas bravas", amount: Money(1400), claimantIDs: [me.id, alex.id]),
                ReceiptItem(name: "Paella", amount: Money(4800), claimantIDs: [alex.id, sam.id]),
                ReceiptItem(name: "Sparkling water", amount: Money(700))
            ],
            tax: Money(592), tip: Money(1200), enteredTotal: Money(8692)
        )
    }
}
