import Foundation

protocol APIClient {
    func send<Request, Response>(_ request: Request) async throws -> Response
}

struct AWSAPIClient: APIClient {
    func send<Request, Response>(_ request: Request) async throws -> Response {
        // TODO: Implement AWS networking once API Gateway/AppSync contracts exist.
        fatalError("AWS API client is not implemented in the frontend scaffold.")
    }
}
