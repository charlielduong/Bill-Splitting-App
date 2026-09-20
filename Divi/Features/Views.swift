import SwiftUI
import CoreImage.CIFilterBuiltins

struct WelcomeView: View {
    @Environment(DiviStore.self) private var store
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            ZStack { Circle().fill(.white.opacity(0.2)).frame(width: 112, height: 112); Image(systemName: "divide.circle.fill").font(.system(size: 72)).foregroundStyle(.white) }
            Text("Divi").font(.system(size: 46, weight: .bold)).foregroundStyle(.white)
            Text("Split the receipt. See what you owe. Settle without the awkward math.").font(.title3).multilineTextAlignment(.center).foregroundStyle(.white.opacity(0.9)).padding(.horizontal, 34)
            Spacer()
            Button("Continue with Apple") { store.isAuthenticated = true }.buttonStyle(PrimaryButtonStyle()).padding(.horizontal, 24)
            Button("Try local demo") { store.isAuthenticated = true }.font(.headline).foregroundStyle(.white).padding(.bottom, 28)
        }.background(DiviTheme.green.ignoresSafeArea())
    }
}

struct RootView: View {
    @State private var tab = 0
    @State private var showCreate = false
    var body: some View {
        TabView(selection: $tab) {
            NavigationStack { HomeView() }.tabItem { Label("Home", systemImage: "house") }.tag(0)
            NavigationStack { ReceiptsView() }.tabItem { Label("Receipts", systemImage: "doc.text") }.tag(1)
            Color.clear.tabItem { Label("Create Divi", systemImage: "plus.circle.fill") }.tag(2)
            NavigationStack { ActivityView() }.tabItem { Label("Activity", systemImage: "clock") }.tag(3)
            NavigationStack { ProfileView() }.tabItem { Label("Profile", systemImage: "person") }.tag(4)
        }
        .onChange(of: tab) { _, value in if value == 2 { showCreate = true; tab = 0 } }
        .sheet(isPresented: $showCreate) { NavigationStack { CreateDiviView() } }
    }
}

struct HomeView: View {
    @Environment(DiviStore.self) private var store
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 26) {
                Text("Your Divis").font(.largeTitle.bold())
                VStack(alignment: .leading, spacing: 8) {
                    Text("What needs attention").font(.headline).foregroundStyle(.white.opacity(0.85))
                    Text("\(store.divis.filter { $0.state == .claiming }.count) active").font(.system(size: 42, weight: .medium)).foregroundStyle(.white)
                    Text("Claim items or finalize when everyone is ready").foregroundStyle(.white.opacity(0.85))
                }.frame(maxWidth: .infinity, alignment: .leading).padding(26).background(DiviTheme.green, in: RoundedRectangle(cornerRadius: 28))
                LazyVStack(spacing: 0) { ForEach(store.divis) { divi in NavigationLink(value: divi.id) { DiviRow(divi: divi) }.buttonStyle(.plain); Divider() } }
            }.padding(24)
        }.navigationDestination(for: UUID.self) { id in if let divi = store.divis.first(where: { $0.id == id }) { DiviDetailView(divi: divi) } }.toolbar { ToolbarItem(placement: .topBarTrailing) { Image(systemName: "qrcode.viewfinder") } }
    }
}

struct DiviRow: View {
    let divi: Divi
    var body: some View {
        HStack(spacing: 14) {
            RoundedRectangle(cornerRadius: 5).fill(divi.state == .claiming ? DiviTheme.green : DiviTheme.ink).frame(width: 9, height: 54)
            VStack(alignment: .leading, spacing: 4) { Text(divi.title).font(.title3.bold()).foregroundStyle(DiviTheme.ink); Text("\(divi.participants.count) people • \(divi.state.rawValue)").foregroundStyle(.secondary) }
            Spacer(); Text(divi.enteredTotal.formatted).font(.headline).foregroundStyle(DiviTheme.ink); Image(systemName: "chevron.right").foregroundStyle(.tertiary)
        }.padding(.vertical, 18)
    }
}

struct CreateDiviView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(DiviStore.self) private var store
    @State private var isParsing = false
    @State private var draft: Divi?
    var body: some View {
        VStack(spacing: 24) {
            if isParsing { Spacer(); ProgressView().scaleEffect(1.4); Text("Reading your receipt…").font(.title2.bold()); Text("You’ll review every item before anyone can claim it.").multilineTextAlignment(.center).foregroundStyle(.secondary); Spacer() }
            else if let draft { ReceiptEditorView(divi: draft) { store.add($0); dismiss() } }
            else {
                Spacer(); Image(systemName: "camera.viewfinder").font(.system(size: 84)).foregroundStyle(DiviTheme.green); Text("Add your receipt").font(.largeTitle.bold()); Text("Take a photo, choose one from Photos, or start manually.").multilineTextAlignment(.center).foregroundStyle(.secondary)
                Spacer(); Button("Scan receipt") { parse() }.buttonStyle(PrimaryButtonStyle()); Button("Enter manually") { draft = SampleData.dinner(state: .draft) }.font(.headline)
            }
        }.padding(24).navigationTitle("Create Divi").navigationBarTitleDisplayMode(.inline).toolbar { ToolbarItem(placement: .cancellationAction) { Button("Close") { dismiss() } } }
    }
    private func parse() { isParsing = true; Task { draft = try? await MockReceiptParsingService().parseReceipt(); isParsing = false } }
}

struct ReceiptEditorView: View {
    @State var divi: Divi
    let onConfirm: (Divi) -> Void
    var body: some View {
        Form {
            Section("Receipt") { TextField("Merchant", text: $divi.title); ForEach($divi.items) { $item in HStack { TextField("Item", text: $item.name); Spacer(); Text(item.amount.formatted).foregroundStyle(.secondary) } } }
            Section("Totals") { LabeledContent("Subtotal", value: divi.itemSubtotal.formatted); LabeledContent("Tax", value: divi.tax.formatted); LabeledContent("Tip", value: divi.tip.formatted); LabeledContent("Receipt total", value: divi.enteredTotal.formatted); if !divi.isReconciled { Label("Totals do not reconcile", systemImage: "exclamationmark.triangle.fill").foregroundStyle(.orange) } }
            Section { Button("Begin Claiming") { divi.state = .claiming; onConfirm(divi) }.disabled(!divi.isReconciled).buttonStyle(PrimaryButtonStyle()) }
        }.navigationTitle("Confirm receipt")
    }
}

struct DiviDetailView: View {
    @Environment(DiviStore.self) private var store
    @State var divi: Divi
    @State private var showInvite = false
    @State private var error: String?
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(alignment: .leading, spacing: 8) { Text(divi.state.rawValue.uppercased()).font(.caption.bold()); Text(divi.enteredTotal.formatted).font(.system(size: 48, weight: .medium)); Text("\(divi.unclaimedCount) items unclaimed") }.foregroundStyle(.white).frame(maxWidth: .infinity, alignment: .leading).padding(26).background(DiviTheme.green)
                HStack { QuickAction(icon: "qrcode", title: "Invite") { showInvite = true }; QuickAction(icon: "checkmark.circle", title: "Finalize") { finalize() } }
                VStack(spacing: 0) { ForEach($divi.items) { $item in ClaimRow(item: $item, participants: divi.participants, currentUserID: store.currentUser.id); Divider() } }.padding(.horizontal, 24)
                if let error { Text(error).foregroundStyle(.orange).font(.headline).padding() }
                if divi.state == .finalized { AllocationSummary(divi: $divi) }
            }
        }.navigationTitle(divi.title).navigationBarTitleDisplayMode(.inline).sheet(isPresented: $showInvite) { InviteView(divi: divi) }.onDisappear { store.update(divi) }
    }
    private func finalize() { do { divi.allocations = try AllocationEngine.finalize(divi); divi.state = .finalized; store.update(divi); error = nil } catch AllocationError.unclaimedItems { error = "Every item needs at least one claimant." } catch let allocationError { error = "The receipt must reconcile before finalizing: \(allocationError.localizedDescription)" } }
}

struct QuickAction: View { let icon: String; let title: String; let action: () -> Void; var body: some View { Button(action: action) { VStack { Image(systemName: icon).font(.title2).frame(width: 64, height: 64).foregroundStyle(.white).background(DiviTheme.ink, in: Circle()); Text(title).font(.subheadline.bold()).foregroundStyle(DiviTheme.ink) } }.frame(maxWidth: .infinity) } }

struct ClaimRow: View {
    @Binding var item: ReceiptItem; let participants: [Participant]; let currentUserID: UUID
    private var claimed: Bool { item.claimantIDs.contains(currentUserID) }
    var body: some View { Button { if claimed { item.claimantIDs.remove(currentUserID) } else { item.claimantIDs.insert(currentUserID) } } label: { HStack { VStack(alignment: .leading, spacing: 5) { Text(item.name).font(.headline); Text(item.claimantIDs.isEmpty ? "Unclaimed" : "\(item.claimantIDs.count) claiming").font(.subheadline).foregroundStyle(item.claimantIDs.isEmpty ? .orange : .secondary) }; Spacer(); Text(item.amount.formatted).font(.headline); Image(systemName: claimed ? "checkmark.circle.fill" : "circle").foregroundStyle(claimed ? DiviTheme.green : .secondary).font(.title2) }.padding(.vertical, 18).foregroundStyle(DiviTheme.ink) }.buttonStyle(.plain) }
}

struct AllocationSummary: View {
    @Binding var divi: Divi
    @Environment(\.openURL) private var openURL
    @State private var fallback: VenmoHandoff?
    var body: some View { VStack(alignment: .leading, spacing: 16) { Text("Final balances").font(.title.bold()); ForEach($divi.allocations) { $allocation in if let person = divi.participants.first(where: { $0.id == allocation.participantID }), person.id != divi.payerID { VStack(alignment: .leading, spacing: 8) { HStack { Text(person.name).font(.headline); Spacer(); Text(allocation.outstanding.formatted).font(.headline); StatusPill(title: allocation.requestInitiated ? "Request initiated" : allocation.status.rawValue, tint: allocation.requestInitiated ? .orange : DiviTheme.deepGreen) }; Button("Request with Venmo") { let handoff = VenmoHandoffService.request(recipient: person, amount: allocation.outstanding, note: divi.title); allocation.requestInitiated = true; if let url = handoff.url { openURL(url) } else { fallback = handoff } }.buttonStyle(PrimaryButtonStyle()) }.padding(.vertical, 10) } } }.padding(24).sheet(item: $fallback) { handoff in VStack(spacing: 18) { Text("Request details").font(.title.bold()); Text(handoff.recipient.map { "@\($0)" } ?? "Venmo username unavailable"); Text(handoff.amount).font(.largeTitle.bold()); Text(handoff.note); Button("Done") { fallback = nil }.buttonStyle(PrimaryButtonStyle()) }.padding(24).presentationDetents([.medium]) } }
}

extension VenmoHandoff: Identifiable { var id: String { "\(recipient ?? "unknown")-\(amount)-\(note)" } }

struct InviteView: View { let divi: Divi; var body: some View { VStack(spacing: 24) { Text("Join \(divi.title)").font(.largeTitle.bold()); QRCodeView(text: "https://divi.example/join/\(divi.id.uuidString)").frame(width: 240, height: 240); Text("Scan to claim your items").foregroundStyle(.secondary); ShareLink(item: "https://divi.example/join/\(divi.id.uuidString)") { Label("Share invite", systemImage: "square.and.arrow.up") }.buttonStyle(PrimaryButtonStyle()) }.padding(28) } }

struct QRCodeView: View {
    let text: String
    var body: some View {
        Group {
            if let cgImage {
                Image(decorative: cgImage, scale: 1).interpolation(.none).resizable().scaledToFit()
            } else {
                ContentUnavailableView("QR unavailable", systemImage: "qrcode", description: Text("Share the invitation link instead."))
            }
        }
    }
    private var cgImage: CGImage? {
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(text.utf8)
        guard let output = filter.outputImage else { return nil }
        return CIContext().createCGImage(output.transformed(by: CGAffineTransform(scaleX: 12, y: 12)), from: output.extent)
    }
}

struct ReceiptsView: View { @Environment(DiviStore.self) private var store; var body: some View { List(store.divis) { DiviRow(divi: $0) }.listStyle(.plain).navigationTitle("Receipts") } }
struct ActivityView: View { @Environment(DiviStore.self) private var store; var body: some View { List(store.activity, id: \.self) { Label($0, systemImage: "clock") }.navigationTitle("Activity") } }
struct ProfileView: View { @Environment(DiviStore.self) private var store; var body: some View { Form { Section { LabeledContent("Name", value: store.currentUser.name); LabeledContent("Venmo", value: "@\(store.currentUser.venmoUsername ?? "Not connected")"); LabeledContent("Currency", value: "USD") }; Section { Button("Sign out", role: .destructive) { store.isAuthenticated = false } } }.navigationTitle("Profile") } }
