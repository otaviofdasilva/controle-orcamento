import Movimentacao  from "./model/movimentacao.js";
import Usuario       from "./model/usuario.js";

import acesso        from "./routes/acesso.js";
import express       from "express";
import movimentacoes from "./routes/movimentacoes.js";
import auth          from "./auth.js";


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


    await Usuario.init();
    auth(Usuario);
    acesso(app, Usuario);

    app.listen(process.env.PORT);

}());
