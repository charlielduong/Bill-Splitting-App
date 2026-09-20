import XCTest
@testable import Divi

final class AllocationEngineTests: XCTestCase {
    func testAllocationsReconcileWithReceiptTotal() throws {
        var divi = SampleData.dinner()
        divi.items[2].claimantIDs = [SampleData.me.id, SampleData.sam.id]
        let allocations = try AllocationEngine.finalize(divi)
        XCTAssertEqual(allocations.reduce(0) { $0 + $1.total.minorUnits }, divi.enteredTotal.minorUnits)
    }

    func testUnclaimedItemBlocksFinalization() {
        XCTAssertThrowsError(try AllocationEngine.finalize(SampleData.dinner())) { error in
            XCTAssertEqual(error as? AllocationError, .unclaimedItems)
        }
    }

    func testVenmoHandoffUsesRequestAndExactAmount() throws {
        let handoff = VenmoHandoffService.request(recipient: SampleData.alex, amount: Money(4218), note: "Dinner at Barcelona")
        let components = try XCTUnwrap(handoff.url.flatMap { URLComponents(url: $0, resolvingAgainstBaseURL: false) })
        XCTAssertEqual(components.queryItems?.first(where: { $0.name == "txn" })?.value, "charge")
        XCTAssertEqual(components.queryItems?.first(where: { $0.name == "amount" })?.value, "42.18")
    }
}
