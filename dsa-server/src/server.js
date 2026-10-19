import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

let server;
async function start() {
  await connectDatabase();
  server = app.listen(env.PORT, () => console.log(`DSA Forge API Server listening on http://localhost:${env.PORT}`));
}
async function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  if (server) server.close(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.connection.close();
    process.exit(0);
  });
  else process.exit(0);
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

start().catch(error => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
