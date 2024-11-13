const WAIT_DURATION_MS = 30 * 1000;
const WAIT_INTERVAL_MS = 2 * 1000;

const fastify = require("fastify");

const server = fastify({ logger: { level: "trace" } });

server.addHook("onTimeout", async (req, res) => {
  req.log.error(`timed out`);
});

server.addHook("onRequestAbort", async (req) => {
  req.log.error(`aborted`);
});

server.get("/slow", async (req, res) => {
  let waited = 0;

  do {
    await new Promise((resolve) => setTimeout(resolve, WAIT_INTERVAL_MS));
    waited += WAIT_INTERVAL_MS;
  } while (waited < WAIT_DURATION_MS);

  res.status(201).send("COMPLETE");
});

server.get("/fast", async (req, res) => {
  res.status(200).send("COMPLETE");
});

server.listen({ port: 8080 });
