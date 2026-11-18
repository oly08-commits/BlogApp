const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const User = require("../models/User");
const passport = require("passport");

router.get("/signUp", (req, res) => {
  res.render("user/signUp");
});

router.post("/signUp", async (req, res) => {
  try {
    const errors = [];
    const name = req.body.name;
    const email = req.body.email;
    const pass = req.body.pass;
    const pass2 = req.body.pass2;

    if (
      !name ||
      name.trim() === "" ||
      name == null ||
      typeof name === undefined
    ) {
      errors.push({ text: "Nome inválido." });
    }

    if (
      !email ||
      email.trim() === "" ||
      email == null ||
      typeof email === undefined
    ) {
      errors.push({ text: "Email inválido." });
    }

    if (
      !pass ||
      pass.trim() === "" ||
      pass == null ||
      typeof pass === undefined
    ) {
      errors.push({ text: "Senha inválida." });
    }

    if (pass2 != pass) {
      errors.push({ text: "Senhas diferentes, digite novamente!" });
    }

    if (pass.length < 4) {
      errors.push({
        text: "Senha muito curta, digite uma senha com mais de 3 caracteres.",
      });
    }

    if (errors.length > 0) {
      return res.render("user/signUp", { errors });
    }
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      req.flash("error", "O email digitado já está cadastrado, digite outro!");
      return res.redirect("/user/signUp");
    }
    const hashedPass = await argon2.hash(pass);
    const user = await new User({
      name: name,
      email: email,
      pass: hashedPass,
    });
    await user.save();
    req.flash("success", "Usuário cadastrado com sucesso!");
    return res.redirect("/user/logIn");
  } catch (error) {
    console.log("Erro ao cadastrar usuário");
    req.flash("error", "Erro interno ao cadastrar usuário");
    return res.redirect("/");
  }
});

router.get("/logIn", async (req, res) => {
  res.render("user/logIn");
  /* try {
  } catch (error) {} */
});

router.post("/logIn", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/logIn",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logOut", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return next(err);

      res.redirect("/");
    });
  });
});

module.exports = router;
