export default function controller(m) {
  async function removeReceita(request, response) {
    const id = parseInt(request.params.id);

    try {
      const r = await m.removeReceita({ id });
      response.sendStatus(r ? 204 : 400);
    } catch (e) {
      console.error(e);
      response.sendStatus(500);
    }
  }

  async function selecionaReceitaPeriodo(request, response) {
    const { ano, mes } = request.params;

    try {
      const r = await m.selecionaReceitaPeriodo({
        ano: parseInt(ano),
        mes: parseInt(mes),
      });
      response.json(r);
    } catch (e) {
      console.error(e);
      response.sendStatus(500);
    }
  }

  async function selecionaReceita(request, response) {
    const id = parseInt(request.params.id);
    const descricao = request.query.descricao;
    try {
      const r = await m.selecionaReceita({ id, descricao });
      response.json(r);
    } catch (e) {
      console.error(e);
      response.sendStatus(500);
    }
  }

  async function atualizaReceita(request, response) {
    const id = parseInt(request.params.id);
    const { data, ...info } = request.body;

    try {
      const r = await m.atualizaReceita(
        data ? { id, data: new Date(data), ...info } : { id, ...info }
      );

      response.sendStatus(r ? 204 : 400);
    } catch (e) {
      console.error(e);

      response.status(400).json({
        erro: `não foi possível atualizar receita`,
        receita: data ? { data, ...info } : { ...info },
      });
    }
  }

  async function cadastraReceita(request, response) {
    const { data, ...info } = request.body;

    try {
      const r = await m.cadastraReceita({ data: new Date(data), ...info });

      if (!r.id) throw e;

      response.json(r);
    } catch (e) {
      console.error(e);

      response.status(400).json({
        erro: `não foi possível incluir receita`,
        receita: { data, ...info },
      });
    }
  }

  async function removeDespesa(request, response) {
    const id = parseInt(request.params.id);

    try {
      const r = await m.removeDespesa({ id });
      response.sendStatus(r ? 204 : 400);
    } catch (e) {
      console.error(e);
      response.sendStatus(500);
    }
  }

  async function selecionaDespesaPeriodo(request, response) {
    const { ano, mes } = request.params;

    try {
      const r = await m.selecionaDespesaPeriodo({
        ano: parseInt(ano),
        mes: parseInt(mes),
      });
      response.json(r);
    } catch (e) {
      console.error(e);
      response.sendStatus(500);
    }
  }

  async function selecionaDespesa(request, response) {
    const id = parseInt(request.params.id);
    const descricao = request.query.descricao;

    try {
      const r = await m.selecionaDespesa({ descricao, id });
      response.json(r);
    } catch (e) {
      console.error(e);
      response.sendStatus(500);
    }
  }

  async function atualizaDespesa(request, response) {
    const id = parseInt(request.params.id);
    const { data, ...info } = request.body;

    try {
      const r = await m.atualizaDespesa(
        data ? { id, data: new Date(data), ...info } : { id, ...info }
      );

      response.sendStatus(r ? 204 : 400);
    } catch (e) {
      console.error(e);

      response.status(400).json({
        erro: `não foi possível atualizar despesa`,
        receita: data ? { data, ...info } : { ...info },
      });
    }
  }

  async function cadastraDespesa(request, response) {
    const { data, ...info } = request.body;

    try {
      const r = await m.cadastraDespesa({ data: new Date(data), ...info });

      if (!r.id) throw e;

      response.json(r);
    } catch (e) {
      console.error(e);

      response.status(400).json({
        erro: `não foi possível incluir receita`,
        receita: { data, ...info },
      });
    }
  }

  async function resumoMovimentacao(request, response) {
    const { ano, mes } = request.params;

    try {
      const r = await m.resumoMovimentacao({
        ano: parseInt(ano),
        mes: parseInt(mes),
      });
      response.json(r);
    } catch (e) {
      console.error(e);
      response.sendStatus(500);
    }
  }

  return {
    atualizaDespesa,
    atualizaReceita,
    cadastraDespesa,
    cadastraReceita,
    selecionaDespesa,
    selecionaDespesaPeriodo,
    selecionaReceita,
    selecionaReceitaPeriodo,
    removeDespesa,
    removeReceita,
    resumoMovimentacao,
  };
}
