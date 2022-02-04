import { Pool }     from "pg";
import { EVENTUAL } from "../frequencia.js";
import { DESPESA
       , RECEITA
       }            from "../tipo.js";

import { Despesa, Repo 
       }            from "./repo";


const pool = new Pool({ connectionTimeoutMillis: 2000
                      , database:                process.env["DB_NAME"]
                      , decimalNumbers:          true
                      , host:                    process.env["DB_HOST"]
                      , idleTimeoutMillis:       30000
                      , max:                     5
                      , password:                process.env["DB_PASSWORD"]
                      , port:                    process.env["DB_PORT"]
                      , ssl:                     true
                      , user:           process.env["DB_USER"]
                      });

async function fechaPool() {
    console.log("encerrando pool de conexões.");
    await pool.end();
    console.log("pool encerrado.");
    process.exit(1);
}

process.on("SIGINT", fechaPool);

const GASTOS = { ALIMENTACAO: 0
               , EDUCACAO:    0
               , IMPREVISTOS: 0
               , LAZER:       0
               , MORADIA:     0
               , OUTRAS:      0
               , SAUDE:       0
               , TRANSPORTE:  0
               };

export default class PgRepository implements Repo {

    async destroiTabela() {

        try {
            const query = `DROP TABLE IF EXISTS movimentacao`;
            await pool.query(query);
        } catch (e) {
            console.error(e);
        }

    }

    async preparaTabela() {

        try {
            const query = `CREATE TABLE IF NOT EXISTS movimentacao (
                                id         int NOT NULL AUTO_INCREMENT,
                                descricao  varchar(100) NOT NULL,
                                valor      decimal(10,2) NOT NULL,
                                data       date NOT NULL,
                                tipo       enum('DESPESA', 'RECEITA') NOT NULL,
                                frequencia enum('FIXA','EVENTUAL') DEFAULT NULL,
                                categoria  enum('ALIMENTACAO', 'SAUDE', 'MORADIA', 'TRANSPORTE', 'EDUCACAO', 'LAZER', 'IMPREVISTOS', 'OUTRAS') default 'OUTRAS',
                                PRIMARY KEY  (id)
                            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`

            await pool.query(query);

        } catch (e) {
            console.error(e);
        }
    }

    async selecionaDespesaPeriodo({ ano, mes }: { ano: number, mes: number }): Promise<Despesa[]> {
        const [r] = await pool.query(`SELECT *
                                      FROM   movimentacao
                                      WHERE  YEAR(data) = ? AND MONTH(data) = ? AND tipo = 'DESPESA'`, [ano, mes]);

        return r;
    }

    async selecionaDespesa({ descricao, id } = {}) {

        const [r] = id ? await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'DESPESA' AND id = ?`, id)
                       : descricao ? await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'DESPESA' AND descricao RLIKE ?`, descricao)
                                   : await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'DESPESA'`);

        if (id) {
            return r[0] ? r[0] : null;
        } else {
            return r;
        }

    }

    async selecionaReceita({ descricao, id } = {}) {

        const [r] = id ? await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'RECEITA' AND id = ?`, id)
                       : descricao ? await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'RECEITA' AND descricao RLIKE ?`, descricao)
                                   : await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'RECEITA'`);

        if (id) {
            if (r[0]) {
                const  { id, descricao, valor, data, ..._ } = r[0];
                return { id, descricao, valor, data };
            }

            return null;
        } else {
            return r.map(function ({ id, descricao, valor, data }) {
                return { id, descricao, valor, data };
            });
        }

    }

    async selecionaReceitaPeriodo({ ano, mes }) {

        const [r] = await pool.query(`SELECT *
                                      FROM   movimentacao
                                      WHERE  YEAR(data) = ? AND MONTH(data) = ? AND tipo = 'RECEITA'`, [ano, mes]);

        return r;

    }


    async atualizaDespesa({ id, ...info }) {

        if (!id) return false;

        const [r] = await pool.query(`UPDATE movimentacao SET ? WHERE tipo = 'DESPESA' AND ?`
                                    , [info, { id }]);

        return !!r.affectedRows;
    }

    async atualizaReceita({ id, ...info }) {

        if (!id) return false;

        const [r] = await pool.query(`UPDATE movimentacao SET ? WHERE tipo = 'RECEITA' AND ?`
                                    , [info, { id }]);

        return !!r.affectedRows;
    }

    async removeReceita({ id }) {

        if (!id) return false;

        const [r] = await pool.query(`DELETE FROM movimentacao WHERE tipo = 'RECEITA' AND ?`
                                    , { id });

        return !!r.affectedRows;
    }

    async removeDespesa({ id }) {

        if (!id) return false;

        const [r] = await pool.query(`DELETE FROM movimentacao WHERE tipo = 'DESPESA' AND ?`
                                    , { id });

        return !!r.affectedRows;
    }

    async cadastraReceita({ data, descricao, valor }) {

        const tipo = RECEITA;

        const [r] = await pool.query(`INSERT INTO movimentacao SET ?`
                                    , { data
                                      , descricao
                                      , tipo
                                      , valor
                                      });

        return { id: r.insertId };
    }

    async cadastraDespesa({ categoria, data, descricao, frequencia, valor } = { frequencia: EVENTUAL }) {
        const tipo  = DESPESA;

        const [r] = await pool.query(`INSERT INTO movimentacao SET ?`
                                    , { categoria
                                      , data
                                      , descricao
                                      , tipo
                                      , valor
                                      , frequencia
                                      });

        return { id: r.insertId };
    }

    async resumoMovimentacao({ ano, mes }) {

        const [r] = await pool.query(`SELECT tipo, SUM(valor) total, categoria
                                      FROM movimentacao
                                      WHERE YEAR(data) = ? AND MONTH(data) = ?
                                      GROUP BY categoria, tipo
                                      ORDER BY tipo DESC
                                      `
                                    , [ ano
                                      , mes
                                      ]);

        const gastos        = r.filter(m => m.tipo === DESPESA);
        const totalDespesas = gastos.reduce((t, { total: v }) => v + t, 0);

        const [receitas]    = r.filter(m => m.tipo === RECEITA);
        const totalReceitas = (receitas ?? { total: 0 }).total;

        const detalhamento  = gastos.reduce((o, { categoria, total }) => ({ ...o, [categoria]: total }), {});

        const resumo = { despesas: { ...GASTOS
                                   , ...detalhamento
                                   }
                       , saldo: totalReceitas - totalDespesas
                       , totalReceitas
                       , totalDespesas
                       };

        return resumo;

    }

}
