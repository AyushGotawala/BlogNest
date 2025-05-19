const express = require("express");
const blogRouter = express.Router();
const blogController = require("../controller/blogController");

blogRouter.get("/createBlog",blogController.getCreateBlog);

module.exports = blogRouter;