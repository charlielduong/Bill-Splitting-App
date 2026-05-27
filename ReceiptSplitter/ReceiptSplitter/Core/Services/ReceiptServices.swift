import Foundation

protocol ReceiptParsingServicing {
    func parseReceipt(from imageData: Data) async throws -> ReceiptParseResult
    func loadMockReceipt() async throws -> ReceiptParseResult
}

protocol SplitSessionServicing {
    func createSession(for receipt: Receipt) async throws -> SplitSession
    func addParticipant(named name: String, to session: SplitSession) async throws -> SplitSession
    func generateShareLink(for session: SplitSession) async throws -> URL
    func claim(itemID: UUID, participantID: UUID, in session: SplitSession) async throws -> SplitSession
    func updatePaymentStatus(_ status: PaymentStatus, participantID: UUID, in session: SplitSession) async throws -> SplitSession
}

protocol SplitHistoryServicing {
    func fetchPastSplits() async throws -> [SplitSession]
}
