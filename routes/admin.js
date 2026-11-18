const express = require("express");
const { isAdmin } = require("../helpers/isAdmin");
const router = express.Router();
const Category = require("../models/Category");
const Post = require("../models/Posts");

router.get("/", (req, res) => {
  res.render("admin/index");
});

//CATEGORY

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ date: "desc" }).lean();
    return res.render("admin/categories/categories", { categories });
  } catch (err) {
    console.log("Erro ao listar: " + err);
    req.flash("error", "Erro ao listar categorias");
    return res.redirect("/admin");
  }
});

router.get("/add", (req, res) => {
  res.render("admin/categories/addCategories");
});

router.post("/new", async (req, res) => {
  try {
    const errors = [];
    const name = req.body.name;
    const slug = req.body.slug;
    const catExist = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: slug.trim() }],
    });

    if (
      !name ||
      name.trim() === "" ||
      name == null ||
      typeof name === undefined
    ) {
      errors.push({ text: "Texto inválido." });
    }

    if (
      !slug ||
      slug.trim() === "" ||
      slug == null ||
      typeof slug === undefined
    ) {
      errors.push({ text: "Slug inválido." });
    }

    if (name.length < 2) {
      errors.push({ text: "Nome da categoria muito curto." });
    }

    if (catExist) {
      errors.push({ text: "Categoria já existe, digite outra!" });
    }

    if (errors.length > 0) {
      return res.render("admin/addCategories", { errors });
    }

    const category = new Category({
      name: req.body.name,
      slug: req.body.slug,
    });
    await category.save();
    req.flash("success", "Categoria salva com sucesso!");
    console.log("categoria salva!");
    res.redirect("/admin/categories");
  } catch (err) {
    req.flash("error", "Erro ao salvar categoria, tente novamente!");
    console.log("Erro ao salvar categoria: " + err);
    return res.redirect("/admin/categories");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      req.flash("error", "Categoria não encontrada!");
      return res.redirect("/admin/categories");
    }
    return res.render("admin/categories/editCategories", { category });
  } catch (err) {
    console.log("Erro ao carregar categoria: " + err);
    req.flash("error", "Erro ao carregar categoria!");
    res.render("admin/categories/categories");
  }
});

router.post("/edit/:id", async (req, res) => {
  try {
    const errors = [];
    const name = req.body.name;
    const slug = req.body.slug;
    const catExist = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: slug.trim() }],
    });

    if (
      !name ||
      name.trim() === "" ||
      name == null ||
      typeof name === undefined
    ) {
      errors.push({ text: "Nome inválido." });
    }

    if (
      !slug ||
      slug.trim() === "" ||
      slug == null ||
      typeof slug === undefined
    ) {
      errors.push({ text: "Slug inválido." });
    }

    if (catExist) {
      errors.push({ text: "Categoria já existe, digite outra!" });
    }

    if (name.length < 2 || slug.length < 2) {
      errors.push({ text: "Nome ou slug da categoria muito curto." });
    }

    if (errors.length > 0) {
      const category = Category.findById(req.params.id).lean();

      return res.render("admin/categories/editCategories", {
        errors,
        category,
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      req.flash("error", "Categoria não encontrada!");
      return res.redirect("/admin/categories");
    }
    ((category.name = name.trim()), (category.slug = slug.trim()));

    await category.save();
    req.flash("success", "Categoria editada com sucesso!");
    res.redirect("/admin/categories");
  } catch (err) {
    req.flash("error", "Falha ao editar, tente novamente!");
    console.log("erro ao salvar: " + err);
    res.redirect("/admin/categories");
  }
});

router.get("/delete/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      req.flash("error", "Categoria não encontrada!");
      return res.redirect("/admin/categories");
    }
    req.flash("success", "Categoria deletado com sucesso!");
    return res.redirect("/admin/categories");
  } catch (error) {
    req.flash("error", "Erro ao deletar, tente novamente!");
    return res.redirect("/admin/categories");
  }
});

//POST

router.get("/addPost", async (req, res) => {
  try {
    const category = await Category.find().lean();
    return res.render("admin/posts/addPost", { category });
  } catch (error) {
    console.log("Erro ao carregar postagem: " + error);
    req.flash("error", "Falha ao carregar categoria na postagem.");
    return req.redirect("/admin/addPost");
  }
});

router.post("/addPost", async (req, res) => {
  try {
    const errors = [];
    const title = req.body.title;
    const slug = req.body.slug;
    const description = req.body.description;
    const content = req.body.content;
    const category = req.body.category;
    const postExist = await Post.findOne({
      $or: [
        { title: title.trim() },
        { slug: slug.trim() },
        { description: description.trim() },
        { content: content.trim() },
      ],
    }).lean();

    if (
      !title ||
      title.trim() === "" ||
      title == null ||
      typeof title === undefined
    ) {
      errors.push({ text: "Título inválido." });
    }

    if (
      !slug ||
      slug.trim() === "" ||
      slug == null ||
      typeof slug === undefined
    ) {
      errors.push({ text: "Slug inválido." });
    }

    if (
      !description ||
      description.trim() === "" ||
      description == null ||
      typeof description === undefined
    ) {
      errors.push({ text: "Descrição inválida." });
    }

    if (
      !content ||
      content.trim() === "" ||
      content == null ||
      typeof content === undefined
    ) {
      errors.push({ text: "Conteúdo inválido." });
    }

    if (!category) {
      errors.push({ text: "Registre uma categoria!" });
    }

    if (postExist) {
      errors.push({
        text: "Postagem preenchida com dado/s já registados, digite outro/s dado/s!",
      });
    }

    if (title.length < 2 || slug.length < 2) {
      errors.push({ text: "Título ou slug da postagem muito curto." });
    }

    if (description.length < 2 || content.length < 2) {
      errors.push({ text: "Descrição ou Conteúdo da postagem muito curto." });
    }

    if (errors.length > 0) {
      return res.render("admin/posts/addPost", { errors });
    }

    const post = await new Post({
      title: title,
      slug: slug,
      content: content,
      description: description,
      category: category,
    });
    await post.save();
    req.flash("success", "Postagem publicada com sucesso!");
    return res.redirect("/admin/post");
  } catch (error) {
    console.log("Erro ao adicionar postagem: " + error);
    req.flash("error", "Falha ao adicionar postagem.");
    return req.redirect("/admin/addPost");
  }
});

router.get("/addPostOnCategory/:slug", async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).lean();
    return res.render("admin/posts/addPostOnCategory", { category });
  } catch (error) {
    console.log("Erro ao carregar postagem na categoria: " + error);
    req.flash("error", "Falha ao carregar postagem na categoria.");
    return req.redirect("admin/posts/addPostOnCategory/:slug");
  }
});

router.post("/addPostOnCategory/:slug", async (req, res) => {
  try {
    const errors = [];
    const title = req.body.title;
    const slug = req.body.slug;
    const description = req.body.description;
    const content = req.body.content;
    const category = req.body.category;
    const postExist = await Post.findOne({
      $or: [
        { title: title.trim() },
        { slug: slug.trim() },
        { description: description.trim() },
        { content: content.trim() },
      ],
    }).lean();

    if (
      !title ||
      title.trim() === "" ||
      title == null ||
      typeof title === undefined
    ) {
      errors.push({ text: "Título inválido." });
    }

    if (
      !slug ||
      slug.trim() === "" ||
      slug == null ||
      typeof slug === undefined
    ) {
      errors.push({ text: "Slug inválido." });
    }

    if (
      !description ||
      description.trim() === "" ||
      description == null ||
      typeof description === undefined
    ) {
      errors.push({ text: "Descrição inválida." });
    }

    if (
      !content ||
      content.trim() === "" ||
      content == null ||
      typeof content === undefined
    ) {
      errors.push({ text: "Conteúdo inválido." });
    }

    if (!category) {
      errors.push({ text: "Registre uma categoria!" });
    }

    if (postExist) {
      errors.push({
        text: "Postagem preenchida com dado/s já registados, digite outro/s dado/s!",
      });
    }

    if (title.length < 2 || slug.length < 2) {
      errors.push({ text: "Título ou slug da postagem muito curto." });
    }

    if (description.length < 2 || content.length < 2) {
      errors.push({ text: "Descrição ou Conteúdo da postagem muito curto." });
    }

    if (errors.length > 0) {
      return res.render("admin/posts/addPostOnCategory/:slug", { errors });
    }

    const post = new Post({
      title: title,
      slug: slug,
      content: content,
      description: description,
      category: category,
    });
    await post.save();
    req.flash("success", "Postagem na categoria publicada com sucesso!");
    return res.redirect("/admin/post");
  } catch (error) {
    console.log("Erro ao adicionar postagem na categoria: " + error);
    req.flash("error", "Falha ao adicionar postagem na categoria.");
    return req.redirect("admin/posts/addPostOnCategory/:slug");
  }
});

router.get("/post", async (req, res) => {
  try {
    const posts = await Post.find().populate("category").lean();

    return res.render("admin/posts/posts", { posts });
  } catch (error) {
    console.log("Erro ao listar postagens: " + error);
    req.flash("error", "Erro ao listar postagens");
    return res.redirect("/admin/post");
  }
});

router.get("/editPost/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    const category = await Category.find().lean();
    return res.render("admin/posts/editPost", { category, post });
  } catch (error) {
    console.log("Erro ao renderizar editPost: " + error);
    return res.redirect("/admin/post");
  }
});

router.post("/editPost/:id", async (req, res) => {
  try {
    const errors = [];
    const title = req.body.title;
    const slug = req.body.slug;
    const description = req.body.description;
    const content = req.body.content;
    const category = req.body.category;
    const postExist = await Post.findOne({
      $or: [
        { title: title.trim() },
        { slug: slug.trim() },
        { description: description.trim() },
        { content: content.trim() },
      ],
    }).lean();

    if (
      !title ||
      title.trim() === "" ||
      title == null ||
      typeof title === undefined
    ) {
      errors.push({ text: "Título inválido." });
    }

    if (
      !slug ||
      slug.trim() === "" ||
      slug == null ||
      typeof slug === undefined
    ) {
      errors.push({ text: "Slug inválido." });
    }

    if (
      !description ||
      description.trim() === "" ||
      description == null ||
      typeof description === undefined
    ) {
      errors.push({ text: "Descrição inválida." });
    }

    if (
      !content ||
      content.trim() === "" ||
      content == null ||
      typeof content === undefined
    ) {
      errors.push({ text: "Conteúdo inválido." });
    }

    if (!category) {
      errors.push({ text: "Selecione uma categoria!" });
    }

    if (postExist) {
      errors.push({
        text: "Postagem preenchida com dado/s já registados, digite outro/s dado/s!",
      });
    }

    if (title.length < 2 || slug.length < 2) {
      errors.push({ text: "Título ou slug da postagem muito curto." });
    }

    if (description.length < 2 || content.length < 2) {
      errors.push({ text: "Descrição ou Conteúdo da postagem muito curto." });
    }

    if (errors.length > 0) {
      const category = await Category.find().lean();

      return res.render("admin/posts/editPost", { errors, category });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      req.flash("error", "Postagem não existe, selecione uma válida!");
      return res.redirect("/admin/post");
    }
    ((post.title = title.trim()),
      (post.slug = slug.trim()),
      (post.description = description.trim()),
      (post.content = content.trim()),
      (post.category = category.trim()));
    await post.save();
    req.flash("success", "Postagem editada com sucesso!");
    res.redirect("/admin/post");
  } catch (error) {
    console.log("Erro ao editar postagem: " + error);
    req.flash("error", "Erro ao editar postagem");
    return res.redirect("/admin/post");
  }
});

router.get("/deletePost/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      req.flash("error", "Postagem inexistente.");
      return res.redirect("/admin/post");
    }
    req.flash("success", "Post deletado com sucesso!");
    return res.redirect("/admin/post");
  } catch (error) {
    console.log("Não foi possível deletar o post: " + error);
    req.flash("error", "Falha ao deletar");
    return res.redirect("/admin/post");
  }
});

module.exports = router;
