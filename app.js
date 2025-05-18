const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
db_path = "mongodb://localhost:27017/BlogNest";
app.set('view engine','ejs');
app.set('views','views');

//local Modules
const routePath = require("./utils/pathUtils");
const authRouter = require("./routes/authRouter");
const errors = require("./controller/errorController");

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static(path.join(routePath,'public')));
app.use(authRouter);
app.use(errors);

const dn = '192.168.0.117';

mongoose.connect(db_path).then(()=>{
    app.listen(port,'0.0.0.0',()=>{
        console.log(`application is Running on http://localhost:${port}`);
        console.log(`Also accessible over network at http://${dn}:${port}`);
    });
}).catch(err =>{
    console.log("Error in Connectin to MongoDB");
});