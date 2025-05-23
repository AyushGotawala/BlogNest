const express = require("express");
const blogRouter = express.Router();
const blogController = require("../controller/blogController");

blogRouter.get("/createBlog", blogController.getCreateBlog);
blogRouter.post("/createBlog", blogController.postCreateBlog);
blogRouter.get("/userBlogs", blogController.getUserBlogs);
blogRouter.get("/home", blogController.getBlog);
blogRouter.post("/deleteBlog", blogController.deleteBlog);
blogRouter.get("/updateBlog/:_id", blogController.getUpdateBlog);
blogRouter.post("/updateBlog", blogController.postUpdateBlog);
blogRouter.post("/blog/comment/:postId", blogController.addComment);
blogRouter.delete("/blog/comment/:postId/:commentId", blogController.deleteComment);
blogRouter.get("/readMore/:blogId", blogController.getReadMore);

module.exports = blogRouter;