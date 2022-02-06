import { q } from "./model/model.js"
import Model from "./model/model.js"

let m = new Model;
await m.destroiTabela();
await m.preparaTabela();

const d = await m.cadastraDespesa({ data: new Date(), descricao: "um teste",    valor: 1 });
// await m.cadastraDespesa({ categoria: "MORADIA",     data: new Date(), descricao: "outro teste", valor: 400 });
// await m.cadastraDespesa({ categoria: "ALIMENTACAO", data: new Date(), descricao: "...",         valor: 20 });

// await m.cadastraDespesa({ categoria: "ALIMENTACAO", data: new Date(), descricao: "um teste",    valor: 1 });
// await m.cadastraDespesa({ categoria: "TRANSPORTE",  data: new Date(), descricao: "outro teste", valor: 400 });
// await m.cadastraDespesa({ categoria: "LAZER",       data: new Date(), descricao: "...",         valor: 20 });

// await m.cadastraReceita({ data: new Date(), descricao: "um teste",    valor: 1 });
// await m.cadastraReceita({ data: new Date(), descricao: "outro teste", valor: 400 });
// await m.cadastraReceita({ data: new Date(), descricao: "...",         valor: 20 });

// console.log(await q(`SELECT * FROM movimentacao WHERE tipo = 'DESPESA'`));
// console.log(await q(`SELECT * FROM movimentacao WHERE id = 200`));
// console.log(await q(`UPDATE movimentacao SET valor = 100 WHERE id = 200`));
// console.log(await q(`UPDATE movimentacao SET valor = 1000000 WHERE id = 1 RETURNING *`));
d.valor = 5;
console.log(d);
console.log(await m.atualizaDespesa(d));
// console.log(await m.atualizaDespesa({ id: 1, valor: 2000000, data: new Date(1999, 0, 1) }));

process.emit("SIGINT", 0);

// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(function (_, response, next) {
//     response.setHeader("Access-Control-Allow-Origin", "*");
//     response.removeHeader("x-powered-by");
//     next();
// });

// routes(app);

// app.listen(3000, function () {
//     console.log("localhost @ 3000");
// });
