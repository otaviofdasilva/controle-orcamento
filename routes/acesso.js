import jwt from "jsonwebtoken";
import passport from "passport";

function token(email) {
  return jwt.sign(
    { id: `${email}::${new Date().toISOString()}` },
    process.env.ASSINATURA,
    { expiresIn: "15m" }
  );
}

export default async function acesso(app, m) {
  app
    .route("/api/usuarios/login")
    .post(
      passport.authenticate("local", { session: false }),
      async function (request, response) {
        response.setHeader("auth", token(request.body.email));
        response.sendStatus(200);
      }
    );

  app
    .route("/api/usuarios/logout")
    .post(
      passport.authenticate("bearer", { session: false }),
      async function (request, response) {
        const { authorization } = request.headers;
        const [_, token] = authorization.split(" ");
        try {
          m.adicionaToken(token);
          response.sendStatus(200);
        } catch (e) {
          response.sendStatus(500);
        }
      }
    );

  app
    .route("/api/usuarios")
    .delete(async function (request, response) {
      const { email } = request.body;
      try {
        const r = await m.remove({ email });
        response.status(200).send(r);
      } catch (e) {
        response.status(400);
      }
    })
    .put(async function (request, response) {
      try {
        const r = await m.altera(request.body);
        response.send(r);
      } catch (e) {
        console.error(e);
        response.status(400).json({ erro: "escolha um nome e senha melhores" });
      }
    })
    .post(async function (request, response) {
      try {
        await m.cadastra(request.body);
        response.sendStatus(201);
      } catch (e) {
        console.error(new Date().toISOString(), e);
        response.status(400).json({ erro: "escolha um nome e senha melhores" });
      }
    });
}
