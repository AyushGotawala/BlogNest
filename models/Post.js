const { text } = require("express");
const mongoose = require("mongoose");
const { comment } = require("postcss");

const postSchema = mongoose.Schema({
    title : {
        type : String,
        require : true,
        maxLength : 100
    },
    content : {
        type : String,
        require : true,
        minlength : 10
    },
    author :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        require : true
    },
    tags : {
        type : [String],
        default : [],
    },
    Image : {
        type : String,
        default : null
    },
    likes : [{ type : mongoose.Schema.Types.ObjectId, ref : 'User'}],
    comments : [
        { user : {type : mongoose.Schema.Types.ObjectId,ref : 'User'},
        comment : {type : String,require : true},
        date : {type : Date,default : Date.now}
    }],
});

module.exports = mongoose.model('Post',postSchema);