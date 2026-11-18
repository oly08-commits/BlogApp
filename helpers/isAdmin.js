module.exports = {
  isAdmin: (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "Faça login para continuar.");
      return res.redirect("/user/logIn");
    }

    if (req.user.isAdmin !== 1) {
      req.flash("error", "Acesso restrito aos administradores.");
      return res.redirect("/");
    }

    next();
  },
};
