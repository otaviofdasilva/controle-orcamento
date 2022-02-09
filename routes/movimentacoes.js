import controller from "../controllers/movimentacoes.js";
import passport   from "passport";

const verifica = passport.authenticate("bearer", { session: false });

export default async function movimentacoes(app, m) {

    const { atualizaDespesa
          , atualizaReceita
          , cadastraDespesa
          , cadastraReceita
          , selecionaDespesa
          , selecionaDespesaPeriodo
          , selecionaReceita
          , selecionaReceitaPeriodo
          , removeDespesa
          , removeReceita
          , resumoMovimentacao
          } = controller(m);


    app.get("/api/receitas/:id?",      verifica, selecionaReceita);
    app.get("/api/receitas/:ano/:mes", verifica, selecionaReceitaPeriodo);
    app.post("/api/receitas",          verifica, cadastraReceita);
    app.route("/api/receitas/:id")
       .delete(verifica, removeReceita)
       .patch(verifica,  atualizaReceita);

    app.delete("/api/despesas/:id",    verifica, removeDespesa);
    app.get("/api/despesas/:ano/:mes", verifica, selecionaDespesaPeriodo);
    app.get("/api/despesas/:id?",      verifica, selecionaDespesa);
    app.patch("/api/despesas/:id",     verifica, atualizaDespesa);
    app.post("/api/despesas",          verifica, cadastraDespesa);
    app.get("/api/resumo/:ano/:mes",   verifica, resumoMovimentacao);

}
