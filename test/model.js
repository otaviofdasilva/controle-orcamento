import { expect } from "chai";
import Model from "../model.js";


it("cadastraReceita deve aceitar apenas valor positivo", async function () {
    const pool = {};
    const m    = new Model(pool, "movimentacao_teste");

    const v1 = -1;
    const r1 = await m.cadastraReceita({ valor: v1 });
    expect(r1.valor.valido).to.equal(false);
    expect(r1.valor.valor).to.equal(v1);

    const v2 = 0;
    const r2 = await m.cadastraReceita({ valor: v2 });
    expect(r2.valor.valido).to.equal(false);
    expect(r2.valor.valor).to.equal(v2);

});

