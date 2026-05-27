import Combine
import Foundation

@MainActor
final class QRShareViewModel: ObservableObject {
    @Published var session: SplitSession

    init(session: SplitSession) {
        self.session = session
    }

    var shareLinkText: String {
        session.shareURL?.absoluteString ?? "https://receiptsplitter.example/s/pending"
    }
}
