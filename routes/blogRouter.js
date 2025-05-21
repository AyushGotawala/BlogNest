const express = require("express");
const blogRouter = express.Router();
const blogController = require("../controller/blogController");

blogRouter.get("/createBlog",blogController.getCreateBlog);
blogRouter.post("/createBlog",blogController.postCreateBlog);
blogRouter.get("/userBlogs",blogController.getUserBlogs);
blogRouter.get("/home",blogController.getBlog);
blogRouter.post("/deleteBlog",blogController.deleteBlog);
blogRouter.get("/updateBlog/:_id",blogController.getUpdateBlog);
blogRouter.post("/updateBlog",blogController.postUpdateBlog);

module.exports = blogRouter;