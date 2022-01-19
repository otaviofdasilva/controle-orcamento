function valida({ data, descricao, valor }) {

    const dataInvalida      = { campo:  "data"
                              , erro:   "data não é objeto do tipo Date"
                              , valor:  data
                              , valido: data instanceof Date
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
                ].filter(x => !x.valido) ;

    if (!erros.length) return null; 

    return erros.reduce(function (a, { campo, ...info }) {
        a[campo] = { ...info };
        return a;
    }, {});

}

export default class Model {

    constructor(pool, tabela) {
        this.pool   = pool;
        this.tabela = tabela;
    }

    async cadastraReceita({ data, descricao, valor }) {

        const erros = valida({ data, descricao, valor });

        if (erros) return erros;

        const tipo = "RECEITA";
        const r    = await pool.query(`INSERT INTO {this.tabela} SET ?`
                                     , { data
                                       , descricao
                                       , tipo
                                       , valor
                                       });

        return { id: r.insertId };
    }

}
