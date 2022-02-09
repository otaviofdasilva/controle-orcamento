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
            done(e);
        }
    }

    async function verifica(token, done) {
        try {
            const email = jwt.verify(token, process.env.ASSINATURA);
            console.log(new Date().toISOString(), email);
            const r = await m.verificaEmail(email);
            console.log(new Date().toISOString(), r);
            if (!r) throw new Error("não autorizado");
            done(null, email);
        } catch (e) {
            done(e);
        }
    }

    passport.use(new LocalStrategy({ session:       false
                                   , usernameField: "email"
                                   }
                                   , autoriza));

    passport.use(new BearerStrategy(verifica));

}
