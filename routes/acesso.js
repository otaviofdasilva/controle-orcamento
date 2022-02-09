import passport from "passport";
import               "../auth.js";

export default async function acesso(app, m) {

    app.route("/api/usuarios/login")
       .post(passport.authenticate("local", { session: false })
            , async function(_, response) {
                response.sendStatus(200);
                //   try {
                //       const r = await m.selecionaUsuario(request.body);
                //       if (!r) throw new Error("não autorizado");
                //       console.log(new Date().toISOString(), "autorizado", r);
                //       response.sendStatus(200);
                //   } catch (e) {
                //       console.error(new Date().toISOString(), "não autorizado");
                //       response.status(401).json({ erro: e.message });
                //   }
              });

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
