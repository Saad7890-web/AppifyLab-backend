import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName
});

export async function testDbConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT NOW()");
    return true;
  } finally {
    client.release();
  }
}