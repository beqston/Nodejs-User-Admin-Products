import express from "express";
import { getForgot, getHome, getLogin, getProduct, getProducts, getProfile, getReset, getSignUp, logOutAll, postSignUp, postLogin, postProduct } from "../conntrolers/mainController.js";
const mainRouter = express.Router();
import { errors } from "../utils/errorMessage.js";
import { isAuthHelper, isLogged, pathNow } from "../utils/isAuthHelper.js";
import User from "../models/user.js";
import { userValidation } from "../utils/userValidation.js";
import authMiddleware from "../utils/authMiddleware.js";

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
    const userCookie = req.cookies.user;
    const user = await User.findById(userCookie._id);
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

// Crud operator router
mainRouter.get('/', getHome);
mainRouter.get('/products', getProducts);
mainRouter.get('/product/:id', getProduct);
mainRouter.post('/add-product', postProduct);
mainRouter.route('/signup').get(getSignUp).post(userValidation, postSignUp);
mainRouter.all('/logout', logOutAll);
mainRouter.route('/login').get(getLogin).post(postLogin);
mainRouter.get('/profile/:id', authMiddleware, getProfile);
mainRouter.route('/forgot').get(getForgot).post(async(req, res)=>{
  try {
    const {email} = req.body;
    const user = User.findOne({email});
    if(!user){
      return res.status(403).redirect('/forgot')
    }
    
    const random = Math.ceil(Math.random() * 100000);
    console.log(random);
    return res.status(201).redirect(`/reset/${random}`);
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