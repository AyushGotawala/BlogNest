const errors = (req,res,next) =>{
    res.status(404).render('errors',{title:'error'})
}

module.exports = errors;