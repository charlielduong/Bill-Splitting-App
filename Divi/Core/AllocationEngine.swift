import Foundation

enum AllocationError: Error, Equatable {
    case noParticipants
    case unclaimedItems
    case unreconciledTotal
}

enum AllocationEngine {
    static func finalize(_ divi: Divi) throws -> [Allocation] {
        guard !divi.participants.isEmpty else { throw AllocationError.noParticipants }
        guard divi.items.allSatisfy({ !$0.claimantIDs.isEmpty }) else { throw AllocationError.unclaimedItems }
        guard divi.isReconciled else { throw AllocationError.unreconciledTotal }

        let currency = divi.currencyCode
        let orderedIDs = divi.participants.map(\.id).sorted { $0.uuidString < $1.uuidString }
        var itemTotals = Dictionary(uniqueKeysWithValues: orderedIDs.map { ($0, 0) })

        for item in divi.items {
            let claimants = item.claimantIDs.sorted { $0.uuidString < $1.uuidString }
            let base = item.amount.minorUnits / claimants.count
            let remainder = item.amount.minorUnits % claimants.count
            for (index, id) in claimants.enumerated() { itemTotals[id, default: 0] += base + (index < remainder ? 1 : 0) }
        }

        func distribute(_ amount: Int) -> [UUID: Int] {
            let denominator = max(1, itemTotals.values.reduce(0, +))
            var values: [UUID: Int] = [:]
            var assigned = 0
            for id in orderedIDs {
                let value = amount * itemTotals[id, default: 0] / denominator
                values[id] = value; assigned += value
            }
            var remainder = amount - assigned
            for id in orderedIDs where remainder != 0 {
                let step = remainder > 0 ? 1 : -1
                values[id, default: 0] += step; remainder -= step
            }
            return values
        }

        let taxes = distribute(divi.tax.minorUnits)
        let tips = distribute(divi.tip.minorUnits)
        let fees = distribute(divi.fees.minorUnits)
        let discounts = distribute(divi.discounts.minorUnits)

        return orderedIDs.map { id in
            let item = itemTotals[id, default: 0]
            let total = item + taxes[id, default: 0] + tips[id, default: 0] + fees[id, default: 0] - discounts[id, default: 0]
            return Allocation(participantID: id, items: Money(item, currencyCode: currency), tax: Money(taxes[id, default: 0], currencyCode: currency), tip: Money(tips[id, default: 0], currencyCode: currency), fees: Money(fees[id, default: 0], currencyCode: currency), discounts: Money(discounts[id, default: 0], currencyCode: currency), total: Money(total, currencyCode: currency), paid: Money(0, currencyCode: currency), requestInitiated: false)
        }
    }
}
