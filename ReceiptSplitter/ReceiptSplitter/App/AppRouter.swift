import Combine
import SwiftUI

enum AppRoute: Hashable {
    case receiptCapture
    case receiptReview(Receipt)
    case splitSession(SplitSession)
    case qrShare(SplitSession)
    case claimItems(SplitSession)
    case paymentTracking(SplitSession)
    case history
}

@MainActor
final class AppRouter: ObservableObject {
    @Published var path = NavigationPath()

    func navigate(to route: AppRoute) {
        path.append(route)
    }

    func popToRoot() {
        path.removeLast(path.count)
    }

    @ViewBuilder
    func destination(for route: AppRoute) -> some View {
        switch route {
        case .receiptCapture:
            ReceiptCaptureScreen(viewModel: ReceiptCaptureViewModel())
        case .receiptReview(let receipt):
            ReceiptReviewScreen(viewModel: ReceiptReviewViewModel(receipt: receipt))
        case .splitSession(let session):
            SplitSessionScreen(viewModel: SplitSessionViewModel(session: session))
        case .qrShare(let session):
            QRShareScreen(viewModel: QRShareViewModel(session: session))
        case .claimItems(let session):
            ClaimItemsScreen(viewModel: ClaimItemsViewModel(session: session))
        case .paymentTracking(let session):
            PaymentTrackingScreen(viewModel: PaymentTrackingViewModel(session: session))
        case .history:
            HistoryScreen(viewModel: HistoryViewModel())
        }
    }
}

