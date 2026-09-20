import SwiftUI

@main
struct DiviApp: App {
    @State private var store = DiviStore()
    var body: some Scene {
        WindowGroup {
            Group { if store.isAuthenticated { RootView() } else { WelcomeView() } }
                .environment(store)
                .tint(DiviTheme.green)
        }
    }
}
