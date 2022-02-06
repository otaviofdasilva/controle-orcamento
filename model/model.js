import { default as pg }        from "pg";

import { categorias, OUTRAS }   from "./categoria.js";
import { FIXA,       EVENTUAL } from "./frequencia.js";
import { DESPESA,    RECEITA }  from "./tipo.js";


const { Pool } = pg;
const pool     = new Pool({ connectionTimeoutMillis: 30000
                          , database:                process.env["DB_NAME"].trim()
                          , host:                    process.env["DB_HOST"].trim()
                          , password:                process.env["DB_PASSWORD"].trim()
                          , port:                    process.env["DB_PORT"].trim()
                          , user:                    process.env["DB_USER"].trim()
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

function valida({ data, descricao, valor, }, ...vs) {

    const dataInvalida =      { campo:  "data"
                              , erro:   "data não é objeto do tipo Date"
                              , valido: data instanceof Date
                              , valor:  data
                              };

    const descricaoInvalida = { campo:  "descricao"
                              , erro:   "descricao não deve ser string vazia"
                              , valido: !!descricao
                              , valor:  descricao
                              };

    const valorInvalido =     { campo:  "valor"
                              , erro:   "valor deve ser positivo"
                              , valido: valor > 0
                              , valor:  valor
                              };

    let erros = [ dataInvalida
                , descricaoInvalida
                , valorInvalido
                , ...vs
                ].filter(x => !x.valido);

    if (!erros.length) return null;

    return erros.reduce(function (a, { campo, ...info }) {
        a[campo] = { ...info };
        return a;
    }, {});

}

export async function q(query, ...params) {
    return new Promise(function (resolve, reject) {
        pool.query(query, params, function (e, _) {
            if (e) return reject(e);
            resolve(_);
        });
    });
}

export default class Model {

    async destroiTabela() {

        try {

            await q(`DROP TABLE IF EXISTS movimentacao`);
            await q(`DROP TYPE categoria`);
            await q(`DROP TYPE frequencia`);
            await q(`DROP TYPE tipo`);

        } catch (e) {
            console.error(e);
        }

    }

    async preparaTabela() {

        try {
            await q(`CREATE TYPE tipo AS ENUM('DESPESA', 'RECEITA')`);
            await q(`CREATE TYPE frequencia AS ENUM('FIXA', 'EVENTUAL')`);
            await q(`CREATE TYPE categoria AS ENUM('ALIMENTACAO', 'SAUDE', 'MORADIA', 'TRANSPORTE', 'EDUCACAO', 'LAZER', 'IMPREVISTOS', 'OUTRAS')`);
            await q(`CREATE TABLE IF NOT EXISTS movimentacao (
                        id         SERIAL,
                        descricao  VARCHAR(100) NOT NULL,
                        valor      DECIMAL(10,2) NOT NULL,
                        data       DATE NOT NULL,
                        tipo       tipo NOT NULL,
                        frequencia frequencia DEFAULT NULL,
                        categoria  categoria DEFAULT 'OUTRAS',
                        PRIMARY KEY (id)
                     )`);
        } catch (e) {
            console.error(e);
        }
    }

    async selecionaDespesaPeriodo({ ano, mes }) {

        const r = await q(`SELECT *
                           FROM   movimentacao
                           WHERE  EXTRACT(YEAR FROM data) = $1 AND EXTRACT(MONTH FROM data) = $2 AND tipo = 'DESPESA'`
                         , ano
                         , mes);

        return r.rows;

    }

    async selecionaDespesa({ descricao, id } = {}) {

        if (id) {
            const r = await q(`SELECT * FROM movimentacao WHERE tipo = 'DESPESA' AND id = $1`, id);
            return r.rows[0];
        } else if (descricao) {
            const r = await q(`SELECT *
                               FROM   movimentacao
                               WHERE  tipo = 'DESPESA' AND descricao LIKE $1`
                             , `%${descricao}%`); // ok, input string ainda será escapada pela biblioteca

            return r.rows;
        } else {
            const r = await q(`SELECT * FROM movimentacao WHERE tipo = 'DESPESA'`);
            return r.rows;
        }

    }

    async selecionaReceita({ descricao, id } = {}) {

        if (id) {
            const r = await q("SELECT * FROM movimentacao WHERE tipo = 'RECEITA' AND id = $1", id);
            if (r.rows[0]) {
                const  { id, descricao, valor, data, ..._ } = r.rows[0] || {};
                return { id, descricao, valor: parseFloat(valor), data };
            }
            return null;
        } else if (descricao) {
            const r = await q(`SELECT * FROM movimentacao WHERE tipo = 'RECEITA' AND descricao LIKE $1`, `%${descricao}%`);
            return r.rows.map(function ({ id, descricao, valor, data }) {
                return { id, descricao, valor: parseFloat(valor), data };
            });
        } else {
            const r = await q(`SELECT * FROM movimentacao WHERE tipo = 'RECEITA'`);
            return r.rows.map(function ({ id, descricao, valor, data }) {
                return { id, descricao, valor: parseFloat(valor), data };
            });
        }

    }

    async selecionaReceitaPeriodo({ ano, mes }) {
        const r = await q(`SELECT *
                           FROM   movimentacao
                           WHERE  EXTRACT(YEAR FROM data) = $1 AND EXTRACT(MONTH FROM data) = $2 AND tipo = 'RECEITA'`
                         , ano
                         , mes);

        return r.rows;
    }

    async atualizaDespesa({ categoria, data, descricao, frequencia, id, valor }) {

        if (!id) {
            return false;
        } else {
            const r = await q(`UPDATE movimentacao SET categoria  = $1,
                                                       data       = $2,
                                                       descricao  = $3,
                                                       frequencia = $4,
                                                       valor      = $5
                                    WHERE id = $6
                                    RETURNING *`
                             , categoria
                             , data
                             , descricao
                             , frequencia
                             , valor
                             , id);

            return !!r.rowCount;
        }

    }

    async atualizaReceita({ id, ...info }) {
        if (!id) {
            return false;
        } else {
            const keys   = Object.keys(info);

            const last   = keys.length + 1;
            const params = keys.map(function (k, i) {
                                        return `${k} = $${i + 1}`;
                                    })
                               .join(", ");

            const vals   = keys.map(k => info[k]);
            const query = `UPDATE movimentacao SET ${params} WHERE tipo = 'RECEITA' AND id = $${last} RETURNING *`;
            const r     = await q(query
                                 , ...vals
                                 , id);

            return !!r.rowCount;
        }
    }

    async removeReceita({ id }) {

        if (!id) return false;

        const r = await q(`DELETE FROM movimentacao WHERE tipo = 'RECEITA' AND id = $1`
                         , id);

        return !!r.rowCount;
    }

    async removeDespesa({ id }) {
        if (!id) return false;

        const r = await q(`DELETE FROM movimentacao WHERE tipo = 'DESPESA' AND id = $1`
                         , id);

        return !!r.rowCount;
    }

    async cadastraReceita({ data, descricao, valor }) {

        const erros = valida({ data, descricao, valor });

        if (erros) return erros;

        const tipo = RECEITA;

        const r = await q(`INSERT INTO movimentacao(categoria, data, descricao, tipo, valor) VALUES ('OUTRAS', $1, $2, $3, $4) RETURNING data, descricao, id, valor`
                         , data
                         , descricao
                         , tipo
                         , valor);

        return r.rows[0];
    }

    async cadastraDespesa({ categoria, data, descricao, frequencia, valor } = { frequencia: EVENTUAL }) {

        const f = frequencia || EVENTUAL;
        const c = categoria  || OUTRAS;
        const categoriaInvalida = { campo:  "categoria"
                                  , erro:   `categoria não possui valor correto: ${categorias.join(" | ")}`
                                  , valido: categorias.includes(c)
                                  , valor:  c
                                  };

        const frequenciaInvalida = { campo:  "frequencia"
                                   , erro:   "frequência não possui valor correto: FIXA | EVENTUAL "
                                   , valido: f === FIXA || f === EVENTUAL
                                   , valor:  f
                                   };

        const erros = valida({ data, descricao, valor }, frequenciaInvalida, categoriaInvalida);

        if (erros) return erros;

        const tipo  = DESPESA;

        const r = await q(`INSERT INTO movimentacao (categoria, data, descricao, tipo, valor, frequencia)
                               VALUES($1, $2, $3, $4, $5, $6)
                               RETURNING categoria, data, descricao, frequencia, id, valor`
                         , c
                         , data
                         , descricao
                         , tipo
                         , valor
                         , f);

        return r.rows[0];
    }

    async resumoMovimentacao({ ano, mes }) {

        const r = await q(`SELECT tipo, SUM(valor) total, categoria
                           FROM movimentacao
                           WHERE EXTRACT(YEAR FROM data) = $1 AND EXTRACT(MONTH FROM data) = $2
                           GROUP BY categoria, tipo
                           ORDER BY tipo DESC`
                         , ano
                         , mes);


        const { rows }      = r;
        const gastos        = rows.filter(m => m.tipo === DESPESA);
        const totalDespesas = gastos.reduce((t, { total: v }) => parseFloat(v) + t, 0);

        const [receitas]    = rows.filter(m => m.tipo === RECEITA);
        const totalReceitas = receitas ? parseFloat(receitas.total) : 0;

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
