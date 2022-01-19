import { createPool } from "mysql2/promise";


const pool = createPool({ user:     process.env["DB_USER"]
                        , password: process.env["DB_PASSWORD"]
                        , host:     process.env["DB_HOST"] || "localhost"
                        , port:     process.env["DB_PORT"] || 3306
                        , database: "controle"
                        });

async function fechaPool() {
    console.log("encerrando pool de conexões.");
    await pool.end();
    console.log("pool encerrado.");
}

process.on("SIGINT", fechaPool);

(async function preparaBanco(pool) {

    let c;

    try {
        const tabela_teste = `CREATE TABLE IF NOT EXISTS controle.movimentacao_teste (
                                  id         int NOT NULL AUTO_INCREMENT,
                                  descricao  varchar(100) NOT NULL,
                                  valor      decimal(10,2) NOT NULL,
                                  data       date NOT NULL,
                                  tipo       enum('DESPESA', 'RECEITA') NOT NULL,
                                  frequencia enum('FIXA','EVENTUAL') DEFAULT NULL,
                                  PRIMARY KEY  (id)
                              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`

        const tabela       = `CREATE TABLE IF NOT EXISTS controle.movimentacao (
                                  id         int NOT NULL AUTO_INCREMENT,
                                  descricao  varchar(100) NOT NULL,
                                  valor      decimal(10,2) NOT NULL,
                                  data       date NOT NULL,
                                  tipo       enum('DESPESA', 'RECEITA') NOT NULL,
                                  frequencia enum('FIXA','EVENTUAL') DEFAULT NULL,
                                  PRIMARY KEY  (id)
                              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`

        c = await pool.getConnection();

        await c.beginTransaction();

        await c.query(tabela_teste);

		if (process.env["MODE"] === "producao") {
			await c.query(tabela);
		}

        await c.commit();

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        if (c) {
            await c.rollback();
            await c.release();
        }
    }

}(pool));

export default pool;

