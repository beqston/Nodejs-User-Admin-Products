import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import mainRouter from "./routes/mainRoutes.js";
import cookieParser from "cookie-parser";

import checkTokenExpiry from "./utils/tokenExpire.js";
import session from "express-session";
import  MongoDBStore  from "connect-mongodb-session";
import cors from 'cors';
import mongoSanitize from 'mongo-sanitize';
import adminRouter from "./routes/adminRoutes.js";

dotenv.config();
const port = process.env.PORT || 3000;

const app =  express();
const MongoConnect = MongoDBStore(session);
// CORS config
app.use(cors({
  origin: 'http://localhost:'+port, // your frontend URL
  credentials: true
}));

// trust first proxy
app.set('trust proxy', 1);

app.use(cookieParser());
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// parser request body and json
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// express-session middleware
const store = new MongoConnect({
    uri: process.env.MONGODB_URI,
    collection:'sessions'
});

app.use(session({
    name:'sessionId',
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    expires:new Date(Date.now() + 60 * 60 * 24000),
    store: store,
}));
app.use(checkTokenExpiry);

app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware to sanitize request body, query, and params
app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.params = mongoSanitize(req.params);
  next();
});

// Register main router
app.use(mainRouter);
// register admin router
app.use(adminRouter);
// Page not found
app.use((req, res)=>{
    res.status(404).render('404');
});
// Error Middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});
// Listen server and running
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});