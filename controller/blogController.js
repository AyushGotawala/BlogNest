const getCreateBlog = (req,res,next) =>{
    try {
        res.status(200).render('users/createBlog',{title:'createBlog',user:req.session.user});
    } catch (error) {
        console.log("Error : ",error);
    }
}

module.exports = {
    getCreateBlog,
}