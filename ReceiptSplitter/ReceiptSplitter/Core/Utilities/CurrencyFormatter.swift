import Foundation

enum CurrencyFormatter {
    static let shared: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.maximumFractionDigits = 2
        return formatter
    }()

    static func string(from value: Decimal) -> String {
        shared.string(from: value as NSDecimalNumber) ?? "$0.00"
    }
}
