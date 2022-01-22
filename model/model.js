import { FIXA,    EVENTUAL } from "./frequencia.js";
import { DESPESA, RECEITA, } from "./tipo.js";


function valida({ data, descricao, valor, }, ...vs) {

    const dataInvalida      = { campo:  "data"
                              , erro:   "data não é objeto do tipo Date"
                              , valido: data instanceof Date
                              , valor:  data
                              };

    const descricaoInvalida = { campo:  "descricao"
                              , erro:   "descricao não deve ser string vazia"
                              , valido: !!descricao
                              , valor:  descricao
                              };

    const valorInvalido     = { campo:  "valor"
                              , erro:   "valor deve ser positivo"
                              , valido: valor > 0
                              , valor:  valor
                              };

    let erros = [ dataInvalida
                , descricaoInvalida
                , valorInvalido
                , ...vs
                ].filter(x => !x.valido) ;

    if (!erros.length) return null;

    return erros.reduce(function (a, { campo, ...info }) {
        a[campo] = { ...info };
        return a;
    }, {});

}

export default class Model {

    constructor(pool) {
        this.pool   = pool;
    }

    async destroiTabela() {

        const { pool, tabela } = this;

        try {

            const query = `DROP TABLE IF EXISTS movimentacao`;
            await pool.query(query);

        } catch (e) {
            console.error(e);
        }

    }

    async preparaTabela() {
        const { pool, } = this;

        try {
            const query = `CREATE TABLE IF NOT EXISTS movimentacao (
                                id         int NOT NULL AUTO_INCREMENT,
                                descricao  varchar(100) NOT NULL,
                                valor      decimal(10,2) NOT NULL,
                                data       date NOT NULL,
                                tipo       enum('DESPESA', 'RECEITA') NOT NULL,
                                frequencia enum('FIXA','EVENTUAL') DEFAULT NULL,
                                PRIMARY KEY  (id)
                            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`

            await pool.query(query);

        } catch (e) {
            console.error(e);
        }
    }

    async selecionaDespesa({ id } = {}) {
        const { pool, } = this;
        const [r] = id ? await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'DESPESA' AND id = ?`, id)
                       : await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'DESPESA'`)

        return id ? r[0] : r;
    }

    async selecionaReceita({ id } = {}) {
        const { pool, } = this;
        const [r] = id ? await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'RECEITA' AND id = ?`, id)
                       : await pool.query(`SELECT * FROM movimentacao WHERE tipo = 'RECEITA'`)

        return id ? r[0] : r;
    }

    async atualizaDespesa({ id, ...info }) {

        if (!id) return false;

        const pool = this.pool;

        const [r]  = await pool.query(`UPDATE movimentacao SET ? WHERE tipo = 'DESPESA' AND ?`
                                     , [ info, { id } ]);

        return !!r.affectedRows;
    }

    async atualizaReceita({ id, ...info }) {

        if (!id) return false;

        const pool = this.pool;

        const [r]  = await pool.query(`UPDATE movimentacao SET ? WHERE tipo = 'RECEITA' AND ?`
                                     , [ info, { id } ]);

        return !!r.affectedRows;
    }

    async removeReceita({ id }) {

        if (!id) return false;

        const pool = this.pool;

        const [r]  = await pool.query(`DELETE FROM movimentacao WHERE tipo = 'RECEITA' AND ?`
                                     , { id });

        return !!r.affectedRows;
    }

    async removeDespesa({ id }) {

        if (!id) return false;

        const pool = this.pool;

        const [r]  = await pool.query(`DELETE FROM movimentacao WHERE tipo = 'DESPESA' AND ?`
                                     , { id });

        return !!r.affectedRows;
    }

    async cadastraReceita({ data, descricao, valor }) {

        const erros = valida({ data, descricao, valor });

        if (erros) return erros;

        const tipo = RECEITA;
        const pool = this.pool;

        const [r]  = await pool.query(`INSERT INTO movimentacao SET ?`
                                     , { data
                                       , descricao
                                       , tipo
                                       , valor
                                       });

        return { id: r.insertId };
    }

    async cadastraDespesa({ data, descricao, frequencia, valor } = { frequencia: EVENTUAL }) {

        const f = frequencia || EVENTUAL;
        const frequenciaInvalida = { campo:  "frequencia"
                                   , erro:   "frequência não possui valor correto: FIXA | EVENTUAL "
                                   , valido: f === FIXA || f === EVENTUAL
                                   , valor:  f
                                   };

        const erros = valida({ data, descricao, valor }, frequenciaInvalida);

        if (erros) return erros;

        const tipo = DESPESA;
        const pool = this.pool;

        const [r]  = await pool.query(`INSERT INTO movimentacao SET ?`
                                     , { data
                                       , descricao
                                       , tipo
                                       , valor
                                       , frequencia: f
                                       });

        return { id: r.insertId };
    }
}

