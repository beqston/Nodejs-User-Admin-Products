import express from "express";
import { getHome, getLogin, getProducts, getSignUp, logOutAll, porstSignUp, postLogin } from "../conntrolers/mainController.js";
import User from "../models/user.js";
const mainRouter = express.Router();


mainRouter.get('/', getHome);
mainRouter.get('/products', getProducts);
mainRouter.route('/signup').get( getSignUp).post(porstSignUp);
mainRouter.all('/logout', logOutAll);
mainRouter.route('/login').get(getLogin).post(postLogin);

export default mainRouter;