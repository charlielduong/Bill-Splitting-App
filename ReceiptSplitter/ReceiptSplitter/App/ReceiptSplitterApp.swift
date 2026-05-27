import SwiftUI

@main
struct ReceiptSplitterApp: App {
    @StateObject private var router = AppRouter()
    private let environment = AppEnvironment.mock()

    var body: some Scene {
        WindowGroup {
            NavigationStack(path: $router.path) {
                HomeScreen()
                    .navigationDestination(for: AppRoute.self) { route in
                        router.destination(for: route)
                    }
            }
            .environmentObject(router)
            .environment(\.appEnvironment, environment)
        }
    }
}
