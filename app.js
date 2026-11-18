//import

require("dotenv").config();
const { isAuth } = require("./helpers/isAuth");
const { isAdmin } = require("./helpers/isAdmin");
const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const path = require("path");
const Post = require("./models/Posts");
const Category = require("./models/Category");
const app = express();
const admin = require("./routes/admin");
const user = require("./routes/user");
const passport = require("passport");
const authConfig = require("./config/auth");

//Config

authConfig(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  ((res.locals.success = req.flash("success")),
    (res.locals.error = req.flash("error")),
    (res.locals.user = req.user || null),
    (res.locals.isAdmin = req.user?.isAdmin === 1));
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  try {
    const post = await Post.find()
      .populate("category")
      .sort({ Date: "desc" })
      .lean();
    return res.render("index", { post });
  } catch (error) {
    console.log("Erro ao listar os posts na home: " + error);
    req.flash("error", "Erro ao listar os posts na home.");
    return res.redirect("/404");
  }
});

app.get("/post/:slug", isAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).lean();
    if (post) {
      res.render("post/index", { post });
    } else {
      req.flash("error", "Postagem inexistente");
      res.redirect("/");
    }
  } catch (error) {
    console.log("Erro ao localizar postagem pelo slug: " + error);
    req.flash("error", "Houve um erro interno");
    res.redirect("/");
  }
});

app.get("/categories", isAuth, async (req, res) => {
  try {
    const category = await Category.find().lean();
    if (category) {
      return res.render("category/index", { category });
    } else {
      req.flash("error", "Categoria inexistente");
      return res.redirect("/");
    }
  } catch (error) {
    console.log("Erro ao localizar categoria: " + error);
    req.flash("error", "Erro ao listar categorias");
    return res.redirect("/");
  }
});

app.get("/categoryElements/:slug", isAuth, async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).lean();
    if (category) {
      const post = await Post.find({ category: category._id }).lean();
      return res.render("category/element", { post, category });
    } else {
      req.flash("error", "Categoria inexistente");
      return res.redirect("/");
    }
  } catch (error) {
    console.log("Erro ao localizar elementos da categoria: " + error);
    req.flash("error", "Erro ao localizar elementos da categoria");
    return res.redirect("/category/index");
  }
});

app.get("/404", (req, res) => {
  res.send("Erro 404");
});

app.use("/admin", isAdmin, admin);
app.use("/user", user);

//Others

const PORT = process.env.PORT || 5501;

async function startServer() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/blogapp");

    console.log("Conexão realizada!");

    app.listen(PORT, () => {
      console.log("Running server on port " + PORT);
    });
  } catch (error) {
    console.log("Erro ao conectar ao DB:", error);
  }
}

startServer();
