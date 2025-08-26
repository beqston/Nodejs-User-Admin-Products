import express from "express";
import { getHome, getLogin, getProducts, getProfile, getSignUp, logOutAll, porstSignUp, postLogin } from "../conntrolers/mainController.js";
const mainRouter = express.Router();
import { errors } from "../utils/errorMessage.js";
import { isAuthHelper, pathNow } from "../utils/isAuthHelper.js";

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

export default mainRouter;