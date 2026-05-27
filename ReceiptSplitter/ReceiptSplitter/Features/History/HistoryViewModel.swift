import Combine
import Foundation

@MainActor
final class HistoryViewModel: ObservableObject {
    @Published var sessions: [SplitSession] = []
    @Published var isLoading = false

    func load(using service: SplitHistoryServicing) async {
        isLoading = true
        defer { isLoading = false }
        sessions = (try? await service.fetchPastSplits()) ?? []
    }
}

