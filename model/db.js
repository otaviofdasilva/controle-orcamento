import { default as pg } from "pg";

const { Pool } = pg;

let pool;
if (process.env.MODE == "development") {
  pool = new Pool({
    connectionTimeoutMillis: 30000,
    database: process.env["DB_NAME"],
    host: process.env["DB_HOST"],
    password: process.env["DB_PASSWORD"],
    port: process.env["DB_PORT"],
    user: process.env["DB_USER"],
  });
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

async function fechaPool() {
  await new Promise(function (resolve, reject) {
    pool.end(function (e) {
      console.log("pool encerrado.");
      e ? reject(e) : resolve(true);
    });
  });

  process.exit(0);
}

process.on("SIGINT", fechaPool);

export default async function q(query, ...params) {
  return new Promise(function (resolve, reject) {
    pool.query(query, params, function (e, _) {
      if (e) return reject(e);
      resolve(_);
    });
  });
}
