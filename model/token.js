import redis from "redis";
import jwt from "jsonwebtoken";

const cliente = redis.createClient();

async function adicionaToken(token) {
  const { id, exp } = jwt.decode(token, process.env.ASSINATURA);
  const k = `token:${id}`;
  cliente.set(k, "");
  cliente.expireAt(k, exp);
}

async function buscaToken(token) {
  const { id, exp } = jwt.decode(token, process.env.ASSINATURA);
  const k = `token:${id}`;
  const invalidado = await cliente.exists(k);
  return !!invalidado;
}

async function init() {
  await cliente.connect();
}

process.on("SIGINT", async function () {
  await cliente.disconnect();
  console.log("cliente redis desconectado");
});

export default { adicionaToken, buscaToken, init };
