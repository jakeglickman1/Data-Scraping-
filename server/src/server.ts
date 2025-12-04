import http from "http";
import app from "./app";
import { env } from "./config/env";

const server = http.createServer(app);
const PORT = env.port || 4000;

server.listen(PORT, () => {
  console.log(`🚀 API ready on http://localhost:${PORT}`);
});
