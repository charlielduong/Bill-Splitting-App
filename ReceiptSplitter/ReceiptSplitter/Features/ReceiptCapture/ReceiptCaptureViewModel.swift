import Combine
import Foundation

@MainActor
final class ReceiptCaptureViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?

    func loadMockReceipt(using service: ReceiptParsingServicing) async -> Receipt? {
        isLoading = true
        defer { isLoading = false }

        do {
            let result = try await service.loadMockReceipt()
            return result.receipt
        } catch {
            errorMessage = "Unable to load mock receipt."
            return nil
        }
    }
}

