import dotenv from "dotenv";
import { server, initApp } from "./src/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initApp();
    server.listen(PORT, () => {
      console.log(`🚀 Central E-commerce Server running on port ${PORT}`);
      console.log(`📡 Local Access: http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/test`);
      console.log(`📡 Version:      http://localhost:${PORT}/api/version`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

// Graceful Shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
