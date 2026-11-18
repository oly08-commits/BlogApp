const User = require("../models/User");
const localStrategy = require("passport-local");
const argon2 = require("argon2");

module.exports = (passport) => {
  passport.use(
    new localStrategy(
      { usernameField: "email", passwordField: "pass" },
      async (email, pass, done) => {
        try {
          const user = await User.findOne({ email: email }).lean();
          if (!user) {
            return done(null, false, {
              message: "A conta digitada não existe",
            });
          }
          const validPass = await argon2.verify(user.pass, pass);
          if (!validPass) {
            return done(null, false, {
              message: "Senha incorreta, tente novamente!",
            });
          }
          return done(null, user);
        } catch (error) {
          console.log("Erro interno na autenticação: " + error);
          return done(error);
        }
      },
    ),
  );
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
