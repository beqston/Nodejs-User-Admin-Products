import express from "express";
import { getForgot, getHome, getLogin, getProducts, getProfile, getReset, getSignUp, logOutAll, porstSignUp, postLogin } from "../conntrolers/mainController.js";
const mainRouter = express.Router();
import { errors } from "../utils/errorMessage.js";
import { isAuthHelper, pathNow } from "../utils/isAuthHelper.js";
import User from "../models/user.js";

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
// Error-handling middleware
mainRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('<h1>Something broke!</h1>')
});

// Crud operator router
mainRouter.get('/', getHome);
mainRouter.get('/products', getProducts);
mainRouter.route('/signup').get( getSignUp).post(porstSignUp);
mainRouter.all('/logout', logOutAll);
mainRouter.route('/login').get(getLogin).post(postLogin);
mainRouter.get('/profile/:id', getProfile);
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

export default mainRouter;