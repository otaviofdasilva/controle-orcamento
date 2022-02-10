import redis from "redis";
import jwt   from "jsonwebtoken";

const cliente = redis.createClient();

async function adicionaToken(token) {
    console.log(new Date().toISOString(), "adicionaToken", token);
    const { id, exp } = jwt.decode(token, process.env.ASSINATURA)
    console.log(new Date().toISOString(), "adicionaToken", id);
    const k = `token:${id}`;
    cliente.set(k, "");
    console.log("exp", exp);
    cliente.expireAt(k, exp);
}

async function buscaToken(token) {
    console.log(new Date().toISOString(), "buscaToken", token);
    const { id, exp } = jwt.decode(token, process.env.ASSINATURA);
    console.log(new Date().toISOString(), "buscaToken", id);
    const k = `token:${id}`;
    const invalidado = await cliente.exists(k);
    console.log(new Date().toISOString(), "buscaToken", invalidado);
    return !!invalidado;
}

async function init() {
    await cliente.connect(); 
}

process.on("SIGINT", async function () {
    await cliente.disconnect();
    console.log("cliente redis desconectado");
})

export default { adicionaToken
               , buscaToken
               , init
               }
