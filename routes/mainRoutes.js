import express from "express";
import { getForgot, getHome, getLogin, getProduct, getProducts, getProfile, getReset, getSignUp, logOutAll, postSignUp, postLogin, postProduct, postForgot, postReset, getMyPoructs, getApiAllUsers, getApiAllProducts, getCart, addToCart, deleteFromCart, updateCartQuantity, deleteUserAccount, updateUserProfile, getUserProfile, deleteUserProfileImage, uploadImageUserProfile } from "../conntrolers/mainController.js";
const mainRouter = express.Router();
import { errors } from "../utils/errorMessage.js";
import { isAuthHelper, isLogged, pathNow } from "../middleware/isAuthHelper.js";
import User from "../models/user.js";
import { productValidation, userResetValidation, userValidation } from "../utils/Validation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";
import upload from "../utils/multer.js";

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
multer({dest:'uploads/users'});
multer({dest:'uploads/products'});

const productImage = upload('products');
const userImage = upload('users');
const updateUserImage = upload('users');

// Crud operator router
mainRouter.get('/', getHome);
mainRouter.get('/products', getProducts);
mainRouter.get('/product/:id', getProduct);
mainRouter.post('/add-product', productImage.single('image'), productValidation, postProduct);

// Upload the file first, then validate body
mainRouter.route('/signup').get(getSignUp).post(userImage.single('image'), userValidation, postSignUp);
mainRouter.all('/logout', logOutAll);
mainRouter.route('/login').get(getLogin).post(postLogin);
mainRouter.get('/profile/:id', authMiddleware, getProfile);
mainRouter.get('/my-products/:id', getMyPoructs);
mainRouter.route('/forgot').get(getForgot).post(postForgot);
mainRouter.route('/reset/:token').get(getReset).post(userResetValidation, postReset);
mainRouter.get('/cart', getCart);
mainRouter.post('/cart/:productId/quantity', updateCartQuantity)
mainRouter.route('/cart/:id').post(addToCart).delete(deleteFromCart);
mainRouter.route('/user/:id/edit').get(getUserProfile).patch(userResetValidation, updateUserProfile);
mainRouter.delete('/user/:id/delete', deleteUserAccount)
mainRouter.delete('/user/:id/image/delete', deleteUserProfileImage)
mainRouter.patch('/user/:id/upload/image', updateUserImage.single('image'), uploadImageUserProfile)

// get all users
mainRouter.get('/api/v1/users', getApiAllUsers);
// get all products
mainRouter.get('/api/v1/products', getApiAllProducts);

// Error-handling middleware
mainRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('<h1>Something broke!</h1>')
});


export default mainRouter;