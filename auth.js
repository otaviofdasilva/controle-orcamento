import jwt                            from "jsonwebtoken";
import passport                       from "passport";
import { Strategy as LocalStrategy }  from "passport-local";
import { Strategy as BearerStrategy } from "passport-http-bearer";


export default async function auth(m) {

    async function autoriza(email, password, done) {
        try {
            const r = await m.seleciona({ email, password });
            if (!r) throw new Error("não autorizado");
            done(null, email);
        } catch (e) {
            console.error(new Date().toISOString(), "autoriza", e);
            done("não autorizado");
        }
    }

    async function verifica(token, done) {
        try {
            console.log(new Date().toISOString(), "verifica", token);

            const { id } = jwt.verify(token, process.env.ASSINATURA);
            console.log(new Date().toISOString(), "verifica", id);

            const invalidado = await m.buscaToken(token);
            if (invalidado) throw new Error("autorização expirada");

            const [email] = id.split("::");
            const r = await m.verificaEmail(email);
            if (!r) throw new Error("não autorizado");

            done(null, email, { token });
        } catch (e) {
            console.error(new Date().toISOString(), e);
            done("não autorizado");
        }
    }

    passport.use(new LocalStrategy({ session:       false
                                   , usernameField: "email"
                                   }
                                   , autoriza));

    passport.use(new BearerStrategy(verifica));

}
