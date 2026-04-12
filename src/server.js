
import { execSync } from "node:child_process";
import app from "./app.js";
import { env } from "./config/env.js";

function runMigrations() {
  console.log("⏳ Running migrations...");
  execSync("npm run migrate:up", { stdio: "inherit" });
  console.log("✅ Migrations completed");
}

async function start() {
  try {
    
    runMigrations();

    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received. Shutting down gracefully...");
      server.close(() => process.exit(0));
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => process.exit(0));
    });

  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
}

start();








// import app from "./app.js";
// import { env } from "./config/env.js";

// const server = app.listen(env.port, () => {
//   console.log(`Server running on port ${env.port}`);
// });

// process.on("SIGINT", () => {
//   console.log("SIGINT received. Shutting down gracefully...");
//   server.close(() => process.exit(0));
// });

// process.on("SIGTERM", () => {
//   console.log("SIGTERM received. Shutting down gracefully...");
//   server.close(() => process.exit(0));
// });

