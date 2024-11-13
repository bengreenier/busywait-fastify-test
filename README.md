# busywait-fastify-test

This testbed attempts to prove that when the event loop is blocked (e.g. `await new Promise((resolve) => setTimeout(resolve, 30000))`) requests may timeout.

This would be an issue for determining container health (for example) when blocking.s

## Getting Started

To demonstrate this issue, run `pnpm run start` in one console session, and `pnpm run test` in another. The `test` session will use artillery to hit the server, with parallel requests to `/fast` and `/slow`. The `start` session will eventually show `ERROR` log entries for the timed out requests.
