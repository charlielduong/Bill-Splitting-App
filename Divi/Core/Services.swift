import Foundation

protocol ReceiptParsingService: Sendable {
    func parseReceipt() async throws -> Divi
}

struct MockReceiptParsingService: ReceiptParsingService {
    func parseReceipt() async throws -> Divi {
        try await Task.sleep(for: .milliseconds(700))
        return SampleData.dinner(state: .draft)
    }
}

struct VenmoHandoff: Equatable {
    let url: URL?
    let recipient: String?
    let amount: String
    let note: String
}

enum VenmoHandoffService {
    static func request(recipient: Participant, amount: Money, note: String) -> VenmoHandoff {
        let username = recipient.venmoUsername?.trimmingCharacters(in: .whitespacesAndNewlines)
        var components = URLComponents(string: "venmo://paycharge")
        components?.queryItems = [
            URLQueryItem(name: "txn", value: "charge"),
            URLQueryItem(name: "recipients", value: username),
            URLQueryItem(name: "amount", value: String(format: "%.2f", Double(amount.minorUnits) / 100)),
            URLQueryItem(name: "note", value: note)
        ].filter { $0.value?.isEmpty == false }
        return VenmoHandoff(url: username == nil ? nil : components?.url, recipient: username, amount: amount.formatted, note: note)
    }
}
