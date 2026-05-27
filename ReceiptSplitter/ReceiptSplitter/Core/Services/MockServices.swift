import Foundation

struct MockReceiptParsingService: ReceiptParsingServicing {
    func parseReceipt(from imageData: Data) async throws -> ReceiptParseResult {
        // TODO: Replace with AWS-backed OCR and receipt parsing.
        try await Task.sleep(nanoseconds: 250_000_000)
        return MockReceiptData.parseResult
    }

    func loadMockReceipt() async throws -> ReceiptParseResult {
        try await Task.sleep(nanoseconds: 150_000_000)
        return MockReceiptData.parseResult
    }
}

struct MockSplitSessionService: SplitSessionServicing {
    func createSession(for receipt: Receipt) async throws -> SplitSession {
        // TODO: Replace with AWS split session creation API.
        SplitSession(receipt: receipt, participants: MockReceiptData.participants)
    }

    func addParticipant(named name: String, to session: SplitSession) async throws -> SplitSession {
        var updated = session
        updated.participants.append(Participant(displayName: name))
        return updated
    }

    func generateShareLink(for session: SplitSession) async throws -> URL {
        // TODO: Replace with backend-generated web/app deep link.
        URL(string: "https://receiptsplitter.example/s/\(session.id.uuidString)")!
    }

    func claim(itemID: UUID, participantID: UUID, in session: SplitSession) async throws -> SplitSession {
        // TODO: Replace with real-time claim API and conflict handling.
        var updated = session
        updated.claimedItems.append(ClaimedItem(receiptItemID: itemID, participantID: participantID))
        return updated
    }

    func updatePaymentStatus(_ status: PaymentStatus, participantID: UUID, in session: SplitSession) async throws -> SplitSession {
        // TODO: Replace with payment status persistence API.
        var updated = session
        guard let index = updated.participants.firstIndex(where: { $0.id == participantID }) else {
            return updated
        }
        updated.participants[index].paymentStatus = status
        return updated
    }
}

struct MockSplitHistoryService: SplitHistoryServicing {
    func fetchPastSplits() async throws -> [SplitSession] {
        // TODO: Replace with AWS-backed split history API.
        [MockReceiptData.completedSession]
    }
}
