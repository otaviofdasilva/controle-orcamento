export default async function acesso(app, m) {

    app.route("/api/usuarios")
       .delete(async function(request, response) {
                   const { email } = request.body;
                   try {
                       const r = await m.removeUsuario({ email });
                       response.status(200).send(r);
                   } catch (e) {
                       response.status(400);
                   }
               })
       .put(async function(request, response) {
                try {
                    const r = await m.alteraUsuario(request.body);
                    response.send(r);
                } catch (e) {
                    console.error(e);
                    response.status(400).json({ erro: "escolha um nome e senha melhores" });
                }
            })
       .post(async function(request, response) {
                 try {
                     await m.cadastraUsuario(request.body);
                     response.sendStatus(201);
                 } catch (e) {
                     console.error(e);
                     response.status(400).json({ erro: "escolha um nome e senha melhores" });
                 }
             });

}
