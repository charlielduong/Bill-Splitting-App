import Foundation
import SwiftUI

@MainActor
@Observable
final class DiviStore {
    var isAuthenticated = false
    var currentUser = SampleData.me
    var divis: [Divi] = [SampleData.dinner()]
    var activity: [String] = ["Alex joined Dinner at Barcelona", "Receipt ready for claiming"]

    func add(_ divi: Divi) { divis.insert(divi, at: 0); activity.insert("Created \(divi.title)", at: 0) }
    func update(_ divi: Divi) {
        guard let index = divis.firstIndex(where: { $0.id == divi.id }) else { return }
        divis[index] = divi
    }
}
