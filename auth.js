import passport                      from "passport";
import { Strategy as LocalStrategy } from "passport-local";

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

    passport.use(new LocalStrategy({ session:       false
                                   , usernameField: "email"
                                   }
                                   , autoriza));

}
