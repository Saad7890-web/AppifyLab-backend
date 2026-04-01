import { testDbConnection } from "../../config/db.js";

export async function healthCheck(req, res, next) {
  try {
    const dbConnected = await testDbConnection();

    return res.status(200).json({
      success: true,
      message: "Server is running",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
}