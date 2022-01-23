import { createPool } from "mysql2/promise";


const pool = createPool({ database:       process.env["DB_NAME"]
                        , decimalNumbers: true
                        , host:           process.env["DB_HOST"] || "localhost"
                        , password:       process.env["DB_PASSWORD"]
                        , port:           process.env["DB_PORT"] || 3306
                        , user:           process.env["DB_USER"]
                        });

async function fechaPool() {
    console.log("encerrando pool de conexões.");
    await pool.end();
    console.log("pool encerrado.");
    process.exit(1);
}

process.on("SIGINT", fechaPool);

export default pool;

