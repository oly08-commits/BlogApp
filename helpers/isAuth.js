module.exports = {
  isAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "Faça login para continuar.");
    return res.redirect("/user/logIn");
  },
};
