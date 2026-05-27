import SwiftUI
import UIKit

enum AppTheme {
    enum Color {
        static let background = SwiftUI.Color(UIColor.systemGroupedBackground)
        static let surface = SwiftUI.Color(UIColor.secondarySystemGroupedBackground)
        static let primary = SwiftUI.Color(red: 0.02, green: 0.34, blue: 0.30)
        static let secondary = SwiftUI.Color(red: 0.17, green: 0.22, blue: 0.27)
        static let accent = SwiftUI.Color(red: 0.92, green: 0.46, blue: 0.25)
        static let muted = SwiftUI.Color(UIColor.secondaryLabel)
        static let divider = SwiftUI.Color(UIColor.separator)
        static let success = SwiftUI.Color(red: 0.10, green: 0.52, blue: 0.35)
        static let warning = SwiftUI.Color(red: 0.78, green: 0.48, blue: 0.10)
    }

    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
    }

    enum Radius {
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
    }
}
