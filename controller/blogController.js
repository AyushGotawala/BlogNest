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
        const blog = await Post.find()
        .populate('author','username')
        .populate('comments.user','username')
        .sort({_id : -1});
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

const addComment = async(req,res,next) =>{
    try {
        const {postId} = req.params;
        const {comment} = req.body;
        const userId = req.session.user._id;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post Not Found"
            });
        }

        const newComment = {
            user: userId,
            comment: comment,
            date: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // Get the newly added comment's ID
        const latestComment = post.comments[post.comments.length - 1];

        res.status(200).json({
            success: true,
            commentId: latestComment._id, // Send the comment ID
            username: req.session.user.username,
            comment: comment,
            date: newComment.date
        });

    } catch (error) {
        console.error("Error in addComment:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error adding comment"
        });
    }
}

const deleteComment = async(req,res,next) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.session.user._id;

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Find comment index
        const commentIndex = post.comments.findIndex(
            comment => comment._id.toString() === commentId && 
            comment.user.toString() === userId.toString()
        );

        if(commentIndex === -1) {
            return res.status(403).json({
                success: false,
                message: "Comment not found or unauthorized"
            });
        }

        // Remove the comment
        post.comments.splice(commentIndex, 1);
        await post.save();

        res.status(200).json({ 
            success: true,
            message: "Comment deleted successfully"
        });

    } catch(error) {
        console.error("Error in deleteComment:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting comment"
        });
    }
};

const getReadMore = async(req,res,next) => {
    try {
        const { blogId } = req.params;
        
        if (!mongoose.isValidObjectId(blogId)) {
            return res.status(400).render("errors", { 
                title: "Error",
                message: "Invalid blog ID" 
            });
        }

        // Update: directly populate the likes array instead of using populate('likes')
        const blog = await Post.findById(blogId)
            .populate('author', 'username')
            .populate('comments.user', 'username');

        if (!blog) {
            return res.status(404).render("errors", { 
                title: "Error",
                message: "Blog not found" 
            });
        }

        // Check if the current user has liked the post
        const userHasLiked = blog.likes.includes(req.session.user._id);

        res.render('users/readMore', {
            title: blog.title,
            user: req.session.user,
            blog: blog,
            userHasLiked: userHasLiked
        });

    } catch (error) {
        console.error("Error in getReadMore:", error);
        res.status(500).render("errors", { 
            title: "Error",
            message: "Internal server error" 
        });
    }
};

const toggleLike = async(req,res,next) =>{
    try {
        const {postId} = req.params;
        const userId = req.session.user._id;
    
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post Not Found"
            });
        }

        // Ensure likes array exists
        if (!post.likes) {
            post.likes = [];
        }
    
        const likeIndex = post.likes.findIndex(id => id.toString() === userId.toString());
        let liked = false;
    
        if(likeIndex === -1){
            post.likes.push(userId);
            liked = true;
        } else {
            post.likes.splice(likeIndex, 1);
            liked = false;
        }
    
        await post.save();
        
        return res.status(200).json({
            success: true,
            liked: liked,
            likesCount: post.likes.length
        });
    } catch(error) {
        console.error("Error in toggleLike:", error);
        return res.status(500).json({
            success: false,
            message: "Error processing like"
        });
    }
}

module.exports = {
    getCreateBlog,
    postCreateBlog,
    getUserBlogs,
    getBlog,
    deleteBlog,
    getUpdateBlog,
    postUpdateBlog,
    addComment,
    deleteComment,
    getReadMore,
    toggleLike
}