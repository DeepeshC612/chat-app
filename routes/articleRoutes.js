const Router = require("express").Router();
const article = require("../controllers/articleControllers");
const {
  authenticate,
  resourceAccessMiddleware,
} = require("../middlewares/authMiddleware");
const { findMultipleTags } = require("../middlewares/find-tag.middleware");

Router.post(
  "/add",
  authenticate,
  resourceAccessMiddleware(["user"]),
  findMultipleTags,
  article.createArticle
);
Router.post(
  "/tag/add",
  authenticate,
  resourceAccessMiddleware(["user"]),
  article.createTag
);
Router.get(
  "/search",
  authenticate,
  resourceAccessMiddleware(["user"]),
  article.listTag
);

module.exports = Router;
