import { categorias, OUTRAS }   from "./categoria.js";
import { FIXA,       EVENTUAL } from "./frequencia.js";
import { DESPESA,    RECEITA, } from "./tipo.js";

const GASTOS = { ALIMENTACAO: 0
               , EDUCACAO: 0
               , IMPREVISTOS: 0
               , LAZER: 0
               , MORADIA: 0
               , OUTRAS: 0
               , SAUDE: 0
               , TRANSPORTE: 0
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

export default class Model {

    constructor(pool) {
        this.pool = pool;
    }

    async destroiTabela() {

        const { pool } = this;

        try {

            const query = `DROP TABLE IF EXISTS movimentacao`;
            await pool.query(query);

        } catch (e) {
            console.error(e);
        }

    }

    async preparaTabela() {
        const { pool } = this;

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

    async selecionaDespesaPeriodo({ ano, mes }) {

        const { pool } = this;

        const [r] = await pool.query(`SELECT *
                                      FROM   movimentacao
                                      WHERE  YEAR(data) = ? AND MONTH(data) = ? AND tipo = 'DESPESA'`, [ano, mes]);

        return r;

    }

    async selecionaDespesa({ descricao, id } = {}) {

        const { pool } = this;

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
        const { pool } = this;

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

        const { pool } = this;

        const [r] = await pool.query(`SELECT *
                                      FROM   movimentacao
                                      WHERE  YEAR(data) = ? AND MONTH(data) = ? AND tipo = 'RECEITA'`, [ano, mes]);

        return r;

    }


    async atualizaDespesa({ id, ...info }) {

        if (!id) return false;

        const pool = this.pool;

        const [r] = await pool.query(`UPDATE movimentacao SET ? WHERE tipo = 'DESPESA' AND ?`
                                    , [info, { id }]);

        return !!r.affectedRows;
    }

    async atualizaReceita({ id, ...info }) {

        if (!id) return false;

        const pool = this.pool;

        const [r] = await pool.query(`UPDATE movimentacao SET ? WHERE tipo = 'RECEITA' AND ?`
            , [info, { id }]);

        return !!r.affectedRows;
    }

    async removeReceita({ id }) {

        if (!id) return false;

        const pool = this.pool;

        const [r] = await pool.query(`DELETE FROM movimentacao WHERE tipo = 'RECEITA' AND ?`
            , { id });

        return !!r.affectedRows;
    }

    async removeDespesa({ id }) {

        if (!id) return false;

        const pool = this.pool;

        const [r] = await pool.query(`DELETE FROM movimentacao WHERE tipo = 'DESPESA' AND ?`
                                    , { id });

        return !!r.affectedRows;
    }

    async cadastraReceita({ data, descricao, valor }) {

        const erros = valida({ data, descricao, valor });

        if (erros) return erros;

        const tipo = RECEITA;
        const pool = this.pool;

        const [r] = await pool.query(`INSERT INTO movimentacao SET ?`
                                    , { data
                                      , descricao
                                      , tipo
                                      , valor
                                      });

        return { id: r.insertId };
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

        const tipo     = DESPESA;
        const { pool } = this;

        const [r] = await pool.query(`INSERT INTO movimentacao SET ?`
                                    , { categoria
                                      , data
                                      , descricao
                                      , tipo
                                      , valor
                                      , frequencia: f
                                      });

        return { id: r.insertId };
    }

    async resumoMovimentacao({ ano, mes }) {

        const { pool } = this;

        const [r] = await pool.query(`
                                       (SELECT 'receitas' detalhes, SUM(valor) total
                                        FROM movimentacao
                                        WHERE tipo = 'RECEITA' AND year(data) = ? AND month(data) = ?)
                                        UNION
                                       (SELECT categoria, SUM(valor) total
                                        FROM movimentacao
                                        WHERE tipo = 'DESPESA' AND year(data) = ? AND month(data) = ?
                                        GROUP BY categoria)
                                      `
                                    , [ ano
                                      , mes
                                      , ano
                                      , mes
                                      ]);


        const [{ total: totalReceitas }, ...gastos] = r;

        if (totalReceitas === null) return null;

        const totalDespesas = gastos.reduce((t, { total: v }) => v + t, 0);
        const detalhamento  = gastos.reduce((o, { detalhes, total }) => ({ ...o, [detalhes]: total }), {});

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
