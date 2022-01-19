// import pool  from "./db.js";
import Model from "./model.js";


(async function () {
    const pool = {};
    const m    = new Model(pool, "movimentacao_teste");

    console.log(await m.cadastraReceita({ data: new Date("2022-01-19"), descricao: ".", valor: 10 }));
    console.log("ran");
}());

