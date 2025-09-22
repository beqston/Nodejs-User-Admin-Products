import express from "express";
import { getForgot, getHome, getLogin, getProduct, getProducts, getProfile, getReset, getSignUp, logOutAll, postSignUp, postLogin, postProduct } from "../conntrolers/mainController.js";
const mainRouter = express.Router();
import { errors } from "../utils/errorMessage.js";
import { isAuthHelper, isLogged, pathNow } from "../utils/isAuthHelper.js";
import User from "../models/user.js";
import { userValidation } from "../utils/userValidation.js";
import authMiddleware from "../utils/authMiddleware.js";
import multer from "multer";
import upload from "../utils/multer.js";
import nodemailer from "nodemailer";

import jwt from 'jsonwebtoken';


//auth middleware
mainRouter.use((req, res, next)=>{
  isAuthHelper(req);
  pathNow(req);
  next();
});

// Error middleware
mainRouter.use((req, res, next)=>{
  if(errors.message){
    setTimeout(()=>{
      errors.message = ''
    }, 200);
  };
  next();
});

// middleware if delete account user
mainRouter.use(async(req, res, next)=>{
  if(isLogged){
    const id = req.cookies.user.id;
    const user = await User.findById(id);
      if(!user){
        req.session.destroy(err => {
          if (err) {
              console.error('Session destruction error:', err);
              return res.status(500).send('Error destroying session');
        }
      // Clear cookie after session destroyed
      res.clearCookie('connect.sid'); // default name unless you've customized it
      res.clearCookie('user');
      res.status(301).redirect('/');
    });
    }
  }
  next();
});

// create uploads folder
multer({dest:'uploads/'});

// Crud operator router
mainRouter.get('/', getHome);
mainRouter.get('/products', getProducts);
mainRouter.get('/product/:id', getProduct);
mainRouter.post('/add-product', postProduct);

// Upload the file first, then validate body
mainRouter.route('/signup').get(getSignUp).post(upload.single('image'), userValidation, postSignUp);
mainRouter.all('/logout', logOutAll);
mainRouter.route('/login').get(getLogin).post(postLogin);
mainRouter.get('/profile/:id', authMiddleware, getProfile);


mainRouter.route('/forgot').get(getForgot).post(async(req, res)=>{
  try {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(403).redirect('/forgot');
    }
    // Create a transporter for SMTP
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.verify();
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: '1h'
    });
    user.token = token;
    await user.save();

    (async () => {
      try {
        const info = await transporter.sendMail({
          from: '"Example Team" <team@example.com>', // sender address
          to: "bako.rap@gmail.com", // list of receivers
          subject: "Hello", // Subject line
          text: `Reset your password here: http://localhost:4000/reset/${token}`, // Fallback for plain text email clients
          html: `<p><b><a href="http://localhost:4000/reset/${token}">Reset Password</a></b></p>`, // HTML clickable link
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      } catch (err) {
        console.error("Error while sending mail", err);
      }
    })();

    
    return res.status(201).redirect('/');
  } catch (error) {
    return res.status(500).send('Internal server error')
  }
  
});

mainRouter.get('/reset/:id', getReset);



// Error-handling middleware
mainRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('<h1>Something broke!</h1>')
});

export default mainRouter;