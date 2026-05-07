import pg from "pg";
import { env } from "./env.js";

const poolConfig: pg.PoolConfig = env.DATABASE_URL
  ? { connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    };

const pool = new pg.Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
  process.exit(-1);
});

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (env.NODE_ENV === "development") {
    console.log(`[DB] query "${text.slice(0, 80)}..." ${duration}ms`);
  }
  return result;
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

export default pool;
