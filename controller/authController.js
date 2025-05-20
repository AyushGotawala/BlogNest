const { check, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const User = require("../models/user");

const getLogin = (req,res,next) =>{
    try{
        req.session.isLoggedIn = false;
        req.session.user = null;
        res.status(200).render('users/Login',{title:'login'});
    }catch(error){
        res.status(500).json({msg : error.message});
    }
}

const getSignUp = (req,res,next) =>{
    try{
        req.session.isLoggedIn = false;
        req.session.user = null;
        res.status(200).render('users/SignUp',{
            title:'login',
            errorMessage : [],
            oldOutput : {}
        });
    }catch(error){
        res.status(500).json({msg : error.message});
    }
}

const postSignUp = [ 
    check('username')
    .trim()
    .notEmpty()
    .withMessage('username Is Required..')
    .isLength({min:3})
    .withMessage('username minimun 3 character and maximun 10 characters allowed')
    .matches(/[a-z]/)
    .withMessage("username only contains lowercase character")
    .matches(/[!@#$%^&*()_]/)
    .withMessage("username must contain atleast on Special case character"),

    check('email')
    .trim()
    .isEmail()
    .withMessage('Please Enter Valid Email Address')
    .normalizeEmail(),

    check('password')
    .trim()
    .isLength({min:8})
    .withMessage('password must contain minimun 8 character')
    .matches(/[a-z]/)
    .withMessage("Password must contain atleast on lowercase character")
    .matches(/[A-Z]/)
    .withMessage("Password must contain atleast on Uppercase character")
    .matches(/[!@#$%^&*.,?|<>|{}:]/)
    .withMessage("Password must contain atleast on Special case character"),

    check('confirmPassword')
    .trim()
    .custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Password and confirm password Must Same');
        }
        return true;
    })
    ,async (req,res,next) =>{
    try{
        const {username,email,password,confirmPassword} = req.body;
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).render('users/SignUp',{
                title:'SignUp',
                errorMessage : errors.array().map(error => error.msg),
                oldOutput : {username,email,password,confirmPassword}
            });
        }

        const usr =  await User.findOne({username:username});
        const emailExist = await User.findOne({email:email});
        if(emailExist || usr){
            if(emailExist){
                return res.status(422).render('users/SignUp',{
                    title:'SignUp',
                    errorMessage : ['email already in use'],
                    oldOutput : {username,email,password,confirmPassword}
                });
            }
            if(usr){
                return res.status(422).render('users/SignUp',{
                    title:'SignUp',
                    errorMessage : ['username already in use'],
                    oldOutput : {username,email,password,confirmPassword}
                });
            }
        }

        bcrypt.hash(password,12).then(hashedpassword =>{
            const user = User({username,email,password:hashedpassword});
                user.save().then().catch(err =>{
                    return res.status(422).render('users/SignUp',{
                    title:'SignUp',
                    errorMessage : err.array().map(error => error.msg),
                    oldOutput : {username,email,password,confirmPassword}
                });
            });
            res.redirect('/Login');
        });
    }catch(error){
        res.status(500).json({msg : error.message});
    }
}];

const postLogin = [

    check('username')
    .trim()
    .notEmpty()
    .withMessage('username Is Required..')
    .isLength({min:3})
    .withMessage('username minimun 3 character and maximun 10 characters allowed')
    .matches(/[a-z]/)
    .withMessage("username only contains lowercase character")
    .matches(/[!@#$%^&*()_]/)
    .withMessage("username must contain atleast on Special case character"),

    check('password')
    .trim()
    .isLength({min:8})
    .withMessage('password must contain minimun 8 character')
    .matches(/[a-z]/)
    .withMessage("Password must contain atleast on lowercase character")
    .matches(/[A-Z]/)
    .withMessage("Password must contain atleast on Uppercase character")
    .matches(/[!@#$%^&*.,?|<>|{}:]/)
    .withMessage("Password must contain atleast on Special case character")
    
    ,async (req,res,next) =>{
        const {username,password} = req.body;
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(422).render('users/Login',{
                title:'Login',
                errorMessage : errors.array().map(error => error.msg),
                oldOutput : {username,password}
            });
        }
        
        const user = await User.findOne({username : username});
        if(!user){
            return res.status(422).render('users/Login',{
                title:'Login',
                errorMessage : ['username not Found!,invalid credentials'],
                oldOutput : {username,password}
            });
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(422).render('users/Login',{
                title:'Login',
                errorMessage : ['invalid credentials'],
                oldOutput : {username,password}
            });
        }
        
        req.session.isLoggedIn = true;
        req.session.user = user;
        res.redirect("/home");
}];

const logout = (req,res,next)=>{
    req.session.destroy(()=>{
        res.redirect('/Login');
    })
}

module.exports = {
    getLogin,
    getSignUp,
    postSignUp,
    postLogin,
    logout
}