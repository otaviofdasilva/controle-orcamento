import q from "./db.js";


export default class Usuario {

    async destroy() {

        try {

            await q(`DROP TABLE IF EXISTS usuarios`);

        } catch (e) {
            console.error(e);
        }

    }

    async init() {

        try {

            await q(`CREATE TABLE IF NOT EXISTS usuarios (
                        email      VARCHAR(300) NOT NULL UNIQUE PRIMARY KEY,
                        hash       VARCHAR(400) NOT NULL
                     )`);

        } catch (e) {
            console.error(e);
        }
    }

    async alteraUsuario({ email, password }) {
        const r = await q(`UPDATE usuarios 
                           SET    hash  = $2
                           WHERE  email = $1`
                         , email
                         , password);

        return !!r.rowCount;
    }

    async cadastraUsuario({ email, password }) {
        return q(`INSERT INTO usuarios (email, hash) VALUES ($1, $2)`, email, password);
    }

    async removeUsuario({ email }) {
        const r = await q(`DELETE 
                           FROM   usuarios 
                           WHERE  email = $1`
                         , email);

        return !!r.rowCount;
    }
}
