import Combine
import Foundation

@MainActor
final class ClaimItemsViewModel: ObservableObject {
    @Published var session: SplitSession
    @Published var selectedItemIDs = Set<UUID>()
    @Published var guestName = ""

    init(session: SplitSession) {
        self.session = session
    }

    func toggleSelection(for item: ReceiptItem) {
        if selectedItemIDs.contains(item.id) {
            selectedItemIDs.remove(item.id)
        } else {
            selectedItemIDs.insert(item.id)
        }
    }

    func confirmClaim() {
        // TODO: Submit guest claims through real-time split session API.
    }
}
