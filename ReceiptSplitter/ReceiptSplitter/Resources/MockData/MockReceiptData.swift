import Foundation

enum MockReceiptData {
    static let receipt: Receipt = {
        let items = [
            ReceiptItem(name: "Burrata Toast", quantity: 1, unitPrice: 14.00),
            ReceiptItem(name: "Spicy Rigatoni", quantity: 2, unitPrice: 23.00),
            ReceiptItem(name: "Grilled Branzino", quantity: 1, unitPrice: 32.00),
            ReceiptItem(name: "Roasted Broccolini", quantity: 1, unitPrice: 11.00),
            ReceiptItem(name: "Tiramisu", quantity: 1, unitPrice: 12.00)
        ]

        return Receipt(
            merchantName: "North Table Bistro",
            items: items,
            totals: ReceiptTotals(subtotal: 115.00, tax: 10.06, tip: 23.00, total: 148.06)
        )
    }()

    static let parseResult = ReceiptParseResult(
        receipt: receipt,
        confidence: 0.94,
        warnings: ["Review item quantities before sharing."]
    )

    static let participants = [
        Participant(displayName: "Maya"),
        Participant(displayName: "Jordan"),
        Participant(displayName: "Taylor")
    ]

    static let completedSession: SplitSession = {
        var session = SplitSession(
            receipt: receipt,
            participants: participants,
            shareURL: URL(string: "https://receiptsplitter.example/s/demo")
        )
        session.participants[0].paymentStatus = .paid
        session.participants[1].paymentStatus = .pending
        return session
    }()
}
