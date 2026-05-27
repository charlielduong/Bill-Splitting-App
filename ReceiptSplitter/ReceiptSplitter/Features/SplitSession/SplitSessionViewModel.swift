import Combine
import Foundation

@MainActor
final class SplitSessionViewModel: ObservableObject {
    @Published var session: SplitSession
    @Published var newParticipantName = ""

    init(session: SplitSession) {
        self.session = session
    }

    func addParticipant(using service: SplitSessionServicing) async {
        let trimmed = newParticipantName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        if let updated = try? await service.addParticipant(named: trimmed, to: session) {
            session = updated
            newParticipantName = ""
        }
    }

    func assignedNames(for item: ReceiptItem) -> String {
        let participantIDs = session.claimedItems
            .filter { $0.receiptItemID == item.id }
            .map(\.participantID)

        let names = session.participants
            .filter { participantIDs.contains($0.id) }
            .map(\.displayName)

        return names.isEmpty ? "Unassigned" : names.joined(separator: ", ")
    }

    func isAssigned(item: ReceiptItem, to participant: Participant) -> Bool {
        session.claimedItems.contains {
            $0.receiptItemID == item.id && $0.participantID == participant.id
        }
    }

    func toggleAssignment(item: ReceiptItem, participant: Participant) {
        if let index = session.claimedItems.firstIndex(where: {
            $0.receiptItemID == item.id && $0.participantID == participant.id
        }) {
            session.claimedItems.remove(at: index)
        } else {
            session.claimedItems.append(ClaimedItem(receiptItemID: item.id, participantID: participant.id))
        }
    }
}

