export default function routes(app) {

    app.get("/controle-orcamento/api/receitas/:id?", async function(request, response) {
        response.json({ id:   request.params.id 
                      , body: request.body
                      });
    });

}

