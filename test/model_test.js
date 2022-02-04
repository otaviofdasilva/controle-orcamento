import { categorias } from "../dist/model/categoria.js";
import { expect }     from "chai";
import { EVENTUAL
       , FIXA
       }              from "../dist/model/frequencia.js";
import Model          from "../dist/model/model.js";
import { ALIMENTACAO
       , EDUCACAO
       , IMPREVISTOS
       , LAZER
       , MORADIA
       , OUTRAS
       , SAUDE
       , TRANSPORTE
       }              from "../dist/model/categoria.js";

// import Repo           from "../dist/model/repositories/pg-repository.js";
import Repo           from "../dist/model/repositories/mysql-repository.js";

/**
 * @type Repo
 */
let m;
beforeEach(async function () {
    m = new Model(new Repo());
    await m.init();
});

afterEach(async function() {
    await m.reset();
});

after(async function () {
    process.emit("SIGINT", 0);
});

describe("Despesas", function () {
    it("atualizaDespesa deve retornar false quando id não estiver presente no objeto passado como argumento", async function () {

        const mov = { valor : 100 };
        const r   = await m.atualizaDespesa(mov);
        expect(r).to.be.equal(false);

    });

    it("atualizaDespesa deve retornar false quando não existir movimentação correspondente ao id informado", async function () {

        const mov     = { data: new Date(), descricao: "teste", valor: 1 };
        const { id }  = await m.cadastraDespesa(mov);

        const mov2    = { id:    200
                        , ...mov
                        , valor: 100 };

        const r       = await m.atualizaDespesa(mov2);
        expect(r).to.be.equal(false);

    });

    it("atualizaDespesa deve retornar true e atualizar registro quando existir movimentação correspondente ao id informado", async function () {

        const mov       = { data: new Date(), descricao: "teste", valor: 1 };
        const { id }    = await m.cadastraDespesa(mov);

        const mov2      = { id
                          , ...mov
                          , valor: 100 };

        const r         = await m.atualizaDespesa(mov2);
        expect(r).to.be.equal(true);

        const { valor } = await m.selecionaDespesa({ id });
        expect(valor).to.be.equal(mov2.valor);

    });

    it("cadastraDespesa deve aceitar apenas valor positivo", async function () {

        const v1 = -1;
        const r1 = await m.cadastraDespesa({ valor: v1 });
        expect(r1.valor.valido).to.equal(false);
        expect(r1.valor.valor).to.equal(v1);

        const v2 = 0;
        const r2 = await m.cadastraDespesa({ valor: v2 });
        expect(r2.valor.valido).to.equal(false);
        expect(r2.valor.valor).to.equal(v2);

    });

    it("cadastraDespesa não deve aceitar descrição vazia", async function () {

        const r1 = await m.cadastraDespesa({ descricao: "" });
        expect(r1.descricao.valido).to.equal(false);
        expect(r1.descricao.valor).to.equal("");

    });

    it("cadastraDespesa não deve aceitar data que não seja instanceof Date", async function () {

        const r1 = await m.cadastraDespesa({ data: "2020-01-01" });
        expect(r1.data.valido).to.equal(false);

    });

    it("cadastraDespesa não deve aceitar frequencia que seja diferente de FIXA | EVENTUAL", async function () {
        const r = await m.cadastraDespesa({ frequencia: "foobar" });
        expect(r.frequencia.valido).to.equal(false);

        const r2 = await m.cadastraDespesa({ frequencia: FIXA });
        expect(r2.frequencia).to.be.undefined;

        const r3 = await m.cadastraDespesa({ frequencia: EVENTUAL });
        expect(r3.frequencia).to.be.undefined;
    });

    it("cadastraDespesa não deve aceitar categoria que seja diferente de ALIMENTACAO | SAUDE | MORADIA | TRANSPORTE | EDUCACAO | LAZER | IMPREVISTOS | OUTRAS", async function () {

        const r = await m.cadastraDespesa({ categoria: "foobar" });
        expect(r.categoria.valido).to.equal(false);

        categorias.forEach(async function (categoria) {
            const r = await m.cadastraDespesa({ categoria });
            expect(r.categoria).to.be.undefined;
        });

    });

    it("cadastraDespesa insere frequencia EVENTUAL como valor padrão", async function () {

        const { id } = await m.cadastraDespesa({ data: new Date(), descricao: "teste", valor: 1 });
        const d      = await m.selecionaDespesa({ id });

        expect(d.frequencia).to.equal(EVENTUAL);
    });

    it("cadastraDespesa deve retornar um objeto com o id inserido na tabela", async function () {

        const r1 = await m.cadastraDespesa({ data: new Date(), descricao: "teste", valor: 1 });
        expect(r1).to.have.property("id");

    });

    it("selecionaDespesa sem argumento deve retornar um array com todas as despesas das movimentações", async function () {

        const mov = { data: new Date(), descricao: "teste", valor: 1 };
        await m.cadastraDespesa(mov);
        await m.cadastraDespesa(mov);
        await m.cadastraDespesa(mov);
        expect(await m.selecionaDespesa()).to.be.lengthOf(3);

    });

    it("selecionaDespesa com argumento com id deve retornar a despesa de id correspondente", async function () {

        const mov    = { data: new Date(), descricao: "teste", valor: 1 };
        const { id } = await m.cadastraDespesa(mov);

        const r   = await m.selecionaDespesa({ id });

        expect(r.data.toLocaleDateString()).to.be.equal(mov.data.toLocaleDateString());
        expect(r.descricao).to.be.equal(mov.descricao);
        expect(r.valor.toFixed(2)).to.be.equal(mov.valor.toFixed(2));
        expect(r.id).to.be.equal(id);
        expect(r.frequencia).to.be.equal(EVENTUAL);

    });

    it("selecionaDespesa com argumento com descricao deve retornar um array de despesas que contenham esta descricao", async function () {

        await m.cadastraDespesa({ data: new Date(), descricao: "um teste",    valor: 1 });
        await m.cadastraDespesa({ data: new Date(), descricao: "outro teste", valor: 400 });
        await m.cadastraDespesa({ data: new Date(), descricao: "...",         valor: 20 });
        const despesas = await m.selecionaDespesa({ descricao: "teste" });
        expect(despesas).to.be.lengthOf(2);
        expect(despesas.map(d => d.descricao)).deep.to.equal(["um teste", "outro teste"]);

    });

    it("selecionaDespesaPeriodo deve retornar um array de despesas do mes e ano passados como argumentos", async function () {

        await m.cadastraDespesa({ data: new Date("2020-02-12"), descricao: "um teste",    valor: 1 });
        await m.cadastraDespesa({ data: new Date("2020-02-09"), descricao: "outro teste", valor: 400 });
        await m.cadastraDespesa({ data: new Date("2021-01-17"), descricao: "...",         valor: 20 });

        const despesas = await m.selecionaDespesaPeriodo({ ano: 2020, mes: 2 });

        expect(despesas).to.be.lengthOf(2);
        expect(new Set(despesas.map(d => d.descricao))).deep.to.equal(new Set(["um teste", "outro teste"]));

    });

    it("removeDespesa deve retornar true e remover registro quando existir movimentação correspondente ao id informado", async function () {

        const mov      = { data: new Date(), descricao: "teste", valor: 1 };
        const { id }   = await m.cadastraDespesa(mov);

        const removido = await m.removeDespesa({ id });
        expect(removido).to.be.equal(true);

    });

    it("removeDespesa deve retornar false quando não existir movimentação correspondente ao id informado", async function () {

        const removido = await m.removeDespesa({ id: 10000000 });
        expect(removido).to.be.equal(false);

    });
});


describe("Receitas", function () {
    it("cadastraReceita deve aceitar apenas valor positivo", async function () {

        const v1 = -1;
        const r1 = await m.cadastraReceita({ valor: v1 });
        expect(r1.valor.valido).to.equal(false);
        expect(r1.valor.valor).to.equal(v1);

        const v2 = 0;
        const r2 = await m.cadastraReceita({ valor: v2 });
        expect(r2.valor.valido).to.equal(false);
        expect(r2.valor.valor).to.equal(v2);

    });

    it("cadastraReceita não deve aceitar descrição vazia", async function () {

        const r1 = await m.cadastraReceita({ descricao: "" });
        expect(r1.descricao.valido).to.equal(false);
        expect(r1.descricao.valor).to.equal("");

    });

    it("cadastraReceita não deve aceitar data que não seja instanceof Date", async function () {

        const r1 = await m.cadastraReceita({ data: "2020-01-01" });
        expect(r1.data.valido).to.equal(false);

    });

    it("cadastraReceita deve retornar um objeto com o id inserido na tabela", async function () {

        const r1 = await m.cadastraReceita({ data: new Date(), descricao: "teste", valor: 1 });
        expect(r1.id).to.be.equal(1);

    });


    it("selecionaReceita sem argumento deve retornar um array com todas as receitas das movimentações", async function () {

        const mov = { data: new Date(), descricao: "teste", valor: 1 };
        await m.cadastraReceita(mov);
        await m.cadastraReceita(mov);
        await m.cadastraReceita(mov);
        expect(await m.selecionaReceita()).to.be.lengthOf(3);

    });

    it("selecionaReceita com argumento com descricao deve retornar um array de receitas que contenham esta descricao", async function () {

        await m.cadastraReceita({ data: new Date(), descricao: "um teste",    valor: 1 });
        await m.cadastraReceita({ data: new Date(), descricao: "outro teste", valor: 400 });
        await m.cadastraReceita({ data: new Date(), descricao: "...",         valor: 20 });
        const receitas = await m.selecionaReceita({ descricao: "teste" });
        expect(receitas).to.be.lengthOf(2);
        expect(receitas.map(r => r.descricao)).deep.to.equal(["um teste", "outro teste"]);
    });

    it("selecionaReceita com argumento com id deve retornar a receita de id correspondente", async function () {

        const mov = { data: new Date(), descricao: "teste", valor: 1 };
        const i   = await m.cadastraReceita(mov);

        const r   = await m.selecionaReceita({ id: i.id });

        expect(r.data.toLocaleDateString()).to.be.equal(mov.data.toLocaleDateString());
        expect(r.descricao).to.be.equal(mov.descricao);
        expect(r.valor.toFixed(2)).to.be.equal(mov.valor.toFixed(2));
        expect(r.id).to.be.equal(i.id);

    });

    it("selecionaReceitaPeriodo deve retornar um array de receitas do mes e ano passados como argumentos", async function () {

        await m.cadastraReceita({ data: new Date("2020-02-12"), descricao: "um teste",    valor: 1 });
        await m.cadastraReceita({ data: new Date("2020-02-09"), descricao: "outro teste", valor: 400 });
        await m.cadastraReceita({ data: new Date("2021-01-17"), descricao: "...",         valor: 20 });

        const receitas = await m.selecionaReceitaPeriodo({ ano: 2020, mes: 2 });

        expect(receitas).to.be.lengthOf(2);
        expect(new Set(receitas.map(r => r.descricao))).deep.to.equal(new Set(["um teste", "outro teste"]));

    });

    it("atualizaReceita deve retornar false quando id não estiver presente no objeto passado como argumento", async function () {

        const mov = { valor : 100 };
        const r   = await m.atualizaReceita(mov);
        expect(r).to.be.equal(false);

    });

    it("atualizaReceita deve retornar false quando não existir movimentação correspondente ao id informado", async function () {

        const mov     = { data: new Date(), descricao: "teste", valor: 1 };
        const { id }  = await m.cadastraReceita(mov);

        const mov2    = { id:    200
                        , ...mov
                        , valor: 100 };

        const r       = await m.atualizaReceita(mov2);
        expect(r).to.be.equal(false);

    });

    it("atualizaReceita deve retornar true e atualizar registro quando existir movimentação correspondente ao id informado", async function () {

        const mov       = { data: new Date(), descricao: "teste", valor: 1 };
        const { id }    = await m.cadastraReceita(mov);

        const mov2      = { id
                          , ...mov
                          , valor: 100 };

        const r         = await m.atualizaReceita(mov2);
        expect(r).to.be.equal(true);

        const { valor } = await m.selecionaReceita({ id });
        expect(valor).to.be.equal(mov2.valor);

    });

    it("removeReceita deve retornar true e remover registro quando existir movimentação correspondente ao id informado", async function () {

        const mov      = { data: new Date(), descricao: "teste", valor: 1 };
        const { id }   = await m.cadastraReceita(mov);

        const removido = await m.removeReceita({ id });
        expect(removido).to.be.equal(true);

    });

    it("removeReceita deve retornar false quando não existir movimentação correspondente ao id informado", async function () {

        const removido = await m.removeReceita({ id: 10000000 });
        expect(removido).to.be.equal(false);

    });
});


describe("Resumo Movimentação", function () {
    it("resumoMovimentacao deve retornar valor total das receitas no mês e ano informados", async function () {

        await m.cadastraReceita({ data: new Date("2020-02-12"), descricao: "prêmio loteria", valor: 1 });
        await m.cadastraReceita({ data: new Date("2020-02-09"), descricao: "aluguel",        valor: 400 });
        await m.cadastraReceita({ data: new Date("2020-01-01"), descricao: "salario",        valor: 1400 });

        await m.cadastraDespesa({ data: new Date("2020-02-22"), categoria: "MORADIA", descricao: "nova casa", valor: 2000 });
        await m.cadastraDespesa({ data: new Date("2020-02-19"), categoria: "LAZER",   descricao: "club bar",  valor: 600 });
        await m.cadastraDespesa({ data: new Date("2020-01-11"), categoria: "SAUDE",   descricao: "aspirina",  valor: 5 });

        const r = await m.resumoMovimentacao({ ano: 2020, mes: 2 });
        expect(r.totalReceitas).to.be.equal(401);

    });

    it("resumoMovimentacao deve retornar valor total das despesas no mês e ano informados", async function () {

        await m.cadastraReceita({ data: new Date("2020-02-02"), descricao: "bilhete loteria", valor: 4.5 });
        await m.cadastraReceita({ data: new Date("2020-02-19"), descricao: "aluguel",         valor: 500 });
        await m.cadastraReceita({ data: new Date("2020-11-01"), descricao: "roupas",          valor: 100 });

        await m.cadastraDespesa({ data: new Date("2020-02-22"), categoria: "MORADIA", descricao: "nova casa", valor: 2000 });
        await m.cadastraDespesa({ data: new Date("2020-02-19"), categoria: "LAZER",   descricao: "club bar",  valor: 600 });
        await m.cadastraDespesa({ data: new Date("2020-01-11"), categoria: "SAUDE",   descricao: "aspirina",  valor: 5 });

        const r = await m.resumoMovimentacao({ ano: 2020, mes: 2 });
        expect(r.totalDespesas).to.be.equal(2600);

    });

    it("resumoMovimentacao deve retornar saldo do mês e ano informados", async function () {

        await m.cadastraReceita({ data: new Date("2020-02-02"), descricao: "bilhete loteria", valor: 4.5 });
        await m.cadastraReceita({ data: new Date("2020-02-19"), descricao: "aluguel",         valor: 500 });
        await m.cadastraReceita({ data: new Date("2020-11-01"), descricao: "roupas",          valor: 100 });

        await m.cadastraDespesa({ data: new Date("2020-02-22"), categoria: "MORADIA", descricao: "nova casa", valor: 2000 });
        await m.cadastraDespesa({ data: new Date("2020-02-19"), categoria: "LAZER",   descricao: "club bar",  valor: 600 });
        await m.cadastraDespesa({ data: new Date("2020-01-11"), categoria: "SAUDE",   descricao: "aspirina",  valor: 5 });

        const r = await m.resumoMovimentacao({ ano: 2020, mes: 2 });
        expect(r.saldo).to.be.equal(504.5 - 2600);

    });

    it("resumoMovimentacao deve retornar objeto seguindo o schema mesmo sem movimentação no mês e ano informados", async function () {
        const r = await m.resumoMovimentacao({ ano: 1999, mes: 1 });
        expect(r.saldo).to.be.equal(0);
        expect(r.totalDespesas).to.be.equal(0);
        expect(r.totalReceitas).to.be.equal(0);
        expect(r.despesas[ALIMENTACAO]).to.be.equal(0);
        expect(r.despesas[EDUCACAO]).to.be.equal(0);
        expect(r.despesas[IMPREVISTOS]).to.be.equal(0);
        expect(r.despesas[LAZER]).to.be.equal(0);
        expect(r.despesas[MORADIA]).to.be.equal(0);
        expect(r.despesas[OUTRAS]).to.be.equal(0);
        expect(r.despesas[SAUDE]).to.be.equal(0);
        expect(r.despesas[TRANSPORTE]).to.be.equal(0);
    });
});
