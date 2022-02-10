import q      from "./db.js";
import bcrypt from "bcrypt";


async function geraHash(senha) {
    if (senha.length < 6) return Promise.reject("Senha insegura");
    return bcrypt.hash(senha, 12);
}

async function destroy() {
    try {
        await q(`DROP TABLE IF EXISTS usuarios`);
    } catch (e) {
        console.error(e);
    }

}

async function init() {
    try {
        await q(`CREATE TABLE IF NOT EXISTS usuarios (
                    email      VARCHAR(300) NOT NULL UNIQUE PRIMARY KEY,
                    hash       VARCHAR(400) NOT NULL
                    )`);
    } catch (e) {
        console.error(e);
    }
}

async function altera({ email, password }) {
    const r = await q(`UPDATE usuarios 
                        SET    hash  = $2
                        WHERE  email = $1`
                     , email
                     , password);

    return !!r.rowCount;
}

async function cadastra({ email, password }) {
    return q(`INSERT INTO usuarios (email, hash) VALUES ($1, $2)`
            , email
            , await geraHash(password));
}

async function remove({ email }) {
    const r = await q(`DELETE 
                        FROM   usuarios 
                        WHERE  email = $1`
                     , email);

    return !!r.rowCount;
}

async function verificaEmail(email) {
    const { rowCount, rows } = await q(`SELECT email, hash
                                        FROM   usuarios
                                        WHERE  email = $1
                                        LIMIT  1`
                                      , email);

    const [usuario] = rows;

    if (!usuario) return Promise.resolve(null);
    return Promise.resolve(email);
}

async function seleciona({ email, password }) {
    const { rowCount, rows } = await q(`SELECT email, hash
                                        FROM   usuarios
                                        WHERE  email = $1
                                        LIMIT  1`
                                      , email);

    const [usuario] = rows;

    if (!usuario) return Promise.resolve(null);
    if (await bcrypt.compare(password, usuario.hash)) return Promise.resolve(email);
    return Promise.resolve(null);
}

export default { altera
               , cadastra
               , destroy
               , init
               , remove
               , seleciona
               , verificaEmail
               }
