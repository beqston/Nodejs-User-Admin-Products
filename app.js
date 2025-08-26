import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import mainRouter from "./routes/mainRoutes.js";
import cookieParser from "cookie-parser";

import session from "express-session";
import  MongoDBStore  from "connect-mongodb-session";


dotenv.config();
const port = process.env.PORT || 3000;

const app =  express();
const MongoConnect = MongoDBStore(session);
app.use(cookieParser());
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static('public'));
// parser request body and json
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// express-session middleware
const store = new MongoConnect({
    uri: process.env.MONGODB_URI,
    collection:'sessions'
});

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(mainRouter);

app.use((req, res)=>{
    res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});