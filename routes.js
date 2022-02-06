import Model from "./model/model.js";


export default async function routes(app) {

    const m = new Model;
    await m.preparaTabela();

    app.delete("/api/receitas/:id", async function(request, response) {
        const id = parseInt(request.params.id);

        try {
            const r = await m.removeReceita({ id });
            response.sendStatus(r ? 204 : 400);
        } catch (e) {
            console.error(e);
            response.sendStatus(500);
        }
    });

    app.get("/api/receitas/:ano/:mes", async function(request, response) {
        const { ano, mes } = request.params;

        try {
            const r = await m.selecionaReceitaPeriodo({ ano: parseInt(ano), mes: parseInt(mes) });
            response.json(r);
        } catch (e) {
            console.error(e);
            response.sendStatus(500);
        }

    });

    app.get("/api/receitas/:id?", async function(request, response) {
        const id        = parseInt(request.params.id);
        const descricao = request.query.descricao;
        try {
            const r = await m.selecionaReceita({ id, descricao });
            response.json(r);
        } catch (e) {
            console.error(e);
            response.sendStatus(500);
        }
    });

    app.patch("/api/receitas/:id", async function(request, response) {
        const id                = parseInt(request.params.id);
        const { data, ...info } = request.body;

        try {
            const r = await m.atualizaReceita(data ? { id, data: new Date(data), ...info }
                                                   : { id, ...info })

            response.sendStatus(r ? 204 : 400);

        } catch (e) {

            console.error(e);

            response.status(400)
                    .json({ erro:    `não foi possível atualizar receita`
                          , receita: (data ? { data, ...info } : { ...info })
                          });

        }
    });

    app.post("/api/receitas", async function(request, response) {

        const { data, ...info } = request.body;

        try {

            const r = await m.cadastraReceita({ data: new Date(data), ...info })

            if (!r.id) throw e;

            response.json(r);

        } catch (e) {

            console.error(e);

            response.status(400)
                    .json({ erro: `não foi possível incluir receita`
                          , receita: { data, ...info }
                          });

        }
    });

    app.delete("/api/despesas/:id", async function(request, response) {
        const id = parseInt(request.params.id);

        try {
            const r = await m.removeDespesa({ id });
            response.sendStatus(r ? 204 : 400);
        } catch (e) {
            console.error(e);
            response.sendStatus(500);
        }
    });


    app.get("/api/despesas/:ano/:mes", async function(request, response) {
        const { ano, mes } = request.params;

        try {
            const r = await m.selecionaDespesaPeriodo({ ano: parseInt(ano), mes: parseInt(mes) });
            response.json(r);
        } catch (e) {
            console.error(e);
            response.sendStatus(500);
        }

    });

    app.get("/api/despesas/:id?", async function(request, response) {
        const id        = parseInt(request.params.id);
        const descricao = request.query.descricao;

        try {
            const r = await m.selecionaDespesa({ descricao, id });
            response.json(r);
        } catch (e) {
            console.error(e);
            response.sendStatus(500);
        }
    });

    app.patch("/api/despesas/:id", async function(request, response) {
        const id                = parseInt(request.params.id);
        const { data, ...info } = request.body;

        try {
            const r = await m.atualizaDespesa(data ? { id, data: new Date(data), ...info }
                                                   : { id, ...info })

            response.sendStatus(r ? 204 : 400);

        } catch (e) {

            console.error(e);

            response.status(400)
                    .json({ erro:    `não foi possível atualizar despesa`
                          , receita: (data ? { data, ...info } : { ...info })
                          });

        }
    });

    app.post("/api/despesas", async function(request, response) {
        const { data, ...info } = request.body;

        try {

            const r = await m.cadastraDespesa({ data: new Date(data), ...info })

            if (!r.id) throw e;

            response.json(r);

        } catch (e) {

            console.error(e);

            response.status(400)
                    .json({ erro: `não foi possível incluir receita`
                          , receita: { data, ...info }
                          });

        }
    });

    app.get("/api/resumo/:ano/:mes", async function(request, response) {

        const { ano, mes } = request.params;

        try {
            const r = await m.resumoMovimentacao({ ano: parseInt(ano), mes: parseInt(mes) });
            response.json(r);
        } catch (e) {
            console.error(e);
            response.sendStatus(500);
        }

    });

}
