const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const fs = require("fs");

// MongoDB connection URI
const db_path = "mongodb://localhost:27017/BlogNest";

// EJS settings
app.set('view engine', 'ejs');
app.set('views', 'views');

// Local Modules
const routePath = require("./utils/pathUtils");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const blogRouter = require("./routes/blogRouter");
const errors = require("./controller/errorController");

// MongoDB session store
const store = new MongoDBStore({
    uri: db_path,
    collection: 'sessions'
});

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/uploads';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fname = file.originalname.split('.')[0];
        cb(null, fname + '-' + Date.now() + ext);
    }
});

const uploads = multer({ storage });

// ✅ Middleware Setup Order Matters

// Serve static files FIRST
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handle file uploads
app.use(uploads.single('image'));

// Session middleware
app.use(session({
    secret: "Ayush@2025",
    resave: false,
    saveUninitialized: true,
    store: store
}));

// Routers that don't require login
app.use(authRouter);

// ✅ Apply login check middleware only to protected routes
app.use((req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.redirect("/Login");
    }
});

// Protected routes
app.use(userRouter);
app.use(blogRouter);

// Global error handler
app.use(errors);

// Start the server
const dn = '192.168.0.117';

mongoose.connect(db_path).then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Application is running on http://localhost:${port}`);
        console.log(`Also accessible over network at http://${dn}:${port}`);
    });
}).catch(err => {
    console.log("Error in connecting to MongoDB:", err);
});
