import { categorias, OUTRAS }   from "./categoria.js";
import { FIXA,       EVENTUAL } from "./frequencia.js";

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

    constructor(repository) {
        this.repo = repository;
    }

    async reset() {
        await this.repo.destroiTabela();
    }

    async init() {
        await this.repo.preparaTabela();
    }

    async selecionaDespesaPeriodo(periodo) {
        return await this.repo.selecionaDespesaPeriodo(periodo);
    }

    async selecionaDespesa(despesa = {}) {
        return await this.repo.selecionaDespesa(despesa);
    }

    async selecionaReceita(receita = {}) {
        return await this.repo.selecionaReceita(receita);
    }

    async selecionaReceitaPeriodo(periodo) {
        return await this.repo.selecionaReceitaPeriodo(periodo);
    }

    async atualizaDespesa(despesa) {
        return await this.repo.atualizaDespesa(despesa);
    }

    async atualizaReceita(receita) {
        return await this.repo.atualizaReceita(receita);
    }

    async removeReceita(receita) {
        return await this.repo.removeReceita(receita);
    }

    async removeDespesa(despesa) {
        return await this.repo.removeDespesa(despesa);
    }

    async cadastraReceita({ data, descricao, valor }) {

        const erros = valida({ data, descricao, valor });

        if (erros) return erros;

        return await this.repo.cadastraReceita({ data, descricao, valor });
    }

    async cadastraDespesa({ categoria, data, descricao, frequencia, valor }) {

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

        return await this.repo.cadastraDespesa({ categoria, data, descricao, frequencia: f, valor });
    }

    async resumoMovimentacao(periodo) {
        return await this.repo.resumoMovimentacao(periodo);
    }

}
