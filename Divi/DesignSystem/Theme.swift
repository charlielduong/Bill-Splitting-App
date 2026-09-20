import SwiftUI

enum DiviTheme {
    static let green = Color(red: 0.44, green: 0.81, blue: 0.27)
    static let deepGreen = Color(red: 0.18, green: 0.52, blue: 0.08)
    static let ink = Color(red: 0.07, green: 0.07, blue: 0.07)
    static let secondary = Color(red: 0.40, green: 0.40, blue: 0.40)
    static let surface = Color(red: 0.965, green: 0.97, blue: 0.96)
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: 58)
            .background(DiviTheme.green.opacity(configuration.isPressed ? 0.78 : 1), in: Capsule())
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

struct StatusPill: View {
    let title: String
    let tint: Color
    var body: some View {
        Text(title).font(.caption.bold()).foregroundStyle(tint).padding(.horizontal, 12).padding(.vertical, 7).background(tint.opacity(0.12), in: Capsule())
    }
}
