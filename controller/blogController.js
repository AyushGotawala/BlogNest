const Post = require('../models/Post');const user = require('../models/user');
const mongoose = require('mongoose');

const getCreateBlog = (req,res,next) =>{
    try {
        res.status(200).render('users/createOrEditBlog',{
            title:'createBlog',
            user:req.session.user,
            editing : false,
            blog : null
        });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).render("errors",{title : 'Errors'});
    }
}

const postCreateBlog = async(req,res,next) =>{
    try{
        const {title,content} = req.body;
        const {tags} = req.body;
        const img = req.file.path;
        const user = req.session.user;

        let tag = tags.split(',');
        tag = tag.map((tg) => tg.trim());

        const blog = new Post({
            title : title,
            content : content,
            author : user._id,
            tags : tag,
            Image : img
        });
        await blog.save();
        res.redirect('/home');
    }catch(error){
        console.log("Error:", error);
        res.status(500).render("errors",{title : 'Errors'});
    }
}

const getUserBlogs = async(req,res,next) =>{
    try{
        const blogs = await Post.find({author : req.session.user._id}).sort({createdAt : -1});
        res.status(200).render('users/blogs',{title : 'Blogs',user : req.session.user,blogs : blogs});
    }catch(error){
        console.log("Error:", error);
        res.status(500).render("errors",{title : 'Errors'});
    }
}

const getBlog = async(req,res,next) =>{
    try{
        const blog = await Post.find().populate('author','username').sort({_id : -1});
        res.render('users/home',{
            title : 'Home',
            user : req.session.user,
            posts : blog
        });
    }catch(error){
        console.log("Error:", error);
        res.status(500).render("errors",{title : 'Errors'});
    }
}

const deleteBlog = async(req,res,next)=>{
    try{
        const blogId = req.body.id;
        Post.findByIdAndDelete(blogId)
        .then(() => {
            res.redirect('/userBlogs');
        })
        .catch((error) => {
            console.error("Error deleting blog:", error);
            res.status(500).render("errors",{title : 'Errors'});
        });
    }catch(error){
        console.log("Error:", error);
        res.status(500).render("errors",{title : 'Errors'});
    }
}

const getUpdateBlog = async (req, res, next) => {
  try {
    const blogId = req.params._id;
    if (!mongoose.isValidObjectId(blogId)) {
      console.error("Invalid blog ID format");
      return res.status(400).render("errors", { title: "Invalid Blog ID" });
    }

    const blog = await Post.findById(blogId);
    if (!blog) {
      return res.status(404).render("errors", { title: "Blog Not Found" });
    }

    res.status(200).render("users/createOrEditBlog", {
      title: "Edit Blog",
      user: req.session.user,
      editing: true,
      blog: blog
    });
  } catch (error) {
    console.error("Error in getEditBlog:", error);
    res.status(500).render("errors", { title: "Errors" });
  }
};

const postUpdateBlog = async (req, res, next) => {
    try{
        const {title,content,blogId} = req.body;
        const {tags} = req.body;
        const img =  !req.file ? false : req.file.path;
        const user = req.session.user;

        let tag = tags.split(',');
        tag = tag.map((tg) => tg.trim());

        const blog = await Post.findById(blogId);
        if (!blog) {
            return res.status(404).render("errors", { title: "Blog Not Found" });
        }
        blog.title = title;
        blog.content = content;
        blog.author = user._id;
        blog.tags = tag;
        blog.Image = img || blog.Image; // Keep the old image if no new one is provided
        await blog.save();
        res.redirect('/userBlogs');
    }catch(error){
        console.log("Error:", error);
        res.status(500).render("errors",{title : 'Errors'});
    }
}


module.exports = {
    getCreateBlog,
    postCreateBlog,
    getUserBlogs,
    getBlog,
    deleteBlog,
    getUpdateBlog,
    postUpdateBlog
}