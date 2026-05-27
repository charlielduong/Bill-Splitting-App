import SwiftUI

struct AppEnvironment {
    let receiptParsingService: ReceiptParsingServicing
    let splitSessionService: SplitSessionServicing
    let historyService: SplitHistoryServicing

    static func mock() -> AppEnvironment {
        AppEnvironment(
            receiptParsingService: MockReceiptParsingService(),
            splitSessionService: MockSplitSessionService(),
            historyService: MockSplitHistoryService()
        )
    }
}

private struct AppEnvironmentKey: EnvironmentKey {
    static let defaultValue = AppEnvironment.mock()
}

extension EnvironmentValues {
    var appEnvironment: AppEnvironment {
        get { self[AppEnvironmentKey.self] }
        set { self[AppEnvironmentKey.self] = newValue }
    }
}
