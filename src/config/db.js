import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  // host: env.dbHost,
  // port: env.dbPort,
  // user: env.dbUser,
  // password: env.dbPassword,
  // database: env.dbName

   connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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