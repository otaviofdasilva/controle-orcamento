import Movimentacao  from "./model/movimentacao.js";
import Usuario       from "./model/usuario.js";

import acesso        from "./routes/acesso.js";
import auth          from "./auth.js";
import express       from "express";
import movimentacoes from "./routes/movimentacoes.js";
import Token         from "./model/token.js"


(async function main() {

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(function (_, response, next) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.removeHeader("x-powered-by");
        next();
    });

    await Movimentacao.init();
    movimentacoes(app, Movimentacao);

    await Token.init();
    await Usuario.init();
    const m = { ...Token, ...Usuario };
    auth(m);
    acesso(app, m);

    app.listen(process.env.PORT);

}());
