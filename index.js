const WAIT_DURATION_MS = 30 * 1000;
const WAIT_INTERVAL_MS = 2 * 1000;

const fastify = require("fastify");

const server = fastify({ logger: { level: "trace" } });

server.addHook("onTimeout", async (req, res) => {
  req.log.error(`timed out`);
});

server.addHook("onRequestAbort", async (req) => {
  req.log.error(`aborted ${req.url}`);
});

/**
 * A polling function that uses `setTimeout` to avoid blocking the event loop when busy-waiting.
 */
function poll(fn, interval) {
  let timerId;

  function check() {
    const result = fn();
    if (result) {
      clearInterval(timerId);
    } else {
      timerId = setTimeout(check, interval);
    }
  }

  check();
}

server.get("/slow", async (req, res) => {
  let waited = 0;

  poll(() => {
    // track that we just waited for X
    waited += WAIT_INTERVAL_MS;

    // check if we've yet waited for Y
    // if we have send a response and stop polling
    if (waited > WAIT_DURATION_MS) {
      res.status(201).send("COMPLETE");
      return true;
    }
    // otherwise keep pooling
    else {
      return false;
    }
  }, WAIT_INTERVAL_MS);

  // fastify still requires waiting for the response to be sent
  // this means we may still have timeouts, but isolated to ONLY this slow route 
  await res;
});

server.get("/fast", async (req, res) => {
  res.status(200).send("COMPLETE");
});

server.listen({ port: 8080 });
