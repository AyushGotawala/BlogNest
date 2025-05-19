const getHome = (req,res,next) =>{
    try {
        res.status(200).render('users/home',{title:'Lending',user:req.session.user});
    } catch (error) {
        console.log("Error : ",error);
    }
}

module.exports = {
    getHome
}