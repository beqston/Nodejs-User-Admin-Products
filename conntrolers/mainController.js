import { errors } from "../utils/errorMessage.js";
import Product from '../models/product.js'
import User from '../models/user.js'
import { isLogged } from "../utils/isAuthHelper.js";
import bcrypt from "bcryptjs";

export const getHome = async(req, res)=> {

   if(isLogged){
        const userCookie = req.cookies.user;
        const user = await User.findById(userCookie._id);
        return res.status(200).render('index', {
        errors,
        isLogged,
        user
    });
   }
    return res.status(200).render('index', {
        errors,
        isLogged
    });
};

export const getLogin = (req, res)=>{
    if(isLogged){
        return res.status(401).redirect('/');
    }
    return res.status(200).render('login', {errors});
};

export const postLogin = async(req, res)=>{
    try {
        const user = await User.findOne({email:req.body.email}).select('+password');
        const password = await bcrypt.compare(req.body.password, user.password);
        if(!password){
            errors.message = 'Your password is incorect!!'
            return res.redirect('/login')
        }
        req.session.isLogged = true;
        res.cookie('user', user);
        return res.status(201).redirect('/');
    } catch (error) {
        // Optional: check for a specific error message
        if (error.message === 'Assignment to constant variable.') {
            errors.message = 'ssignment to constant variable'
            return res.redirect('/login'); // custom page
        }
        // Default fallback on any error
        errors.message = 'interval server error'
        return res.redirect('/'); // or login, or homepage, up to you
    }
}


export const getProducts = async(req, res)=> {
    try {
        let user;
        if(isLogged){
            const userCookie = req.cookies.user;
            user = await User.findById(userCookie._id);
        }
        const products = await Product.find();
        return res.status(200).render('products', {products, errors, isLogged, user});
    } catch (error) {
        return res.status(404).render('products', {error: 'error'})
    }
};

export const getSignUp = (req, res)=>{
    return res.status(200).render('signUp', {errors});
};


export const porstSignUp = async (req, res)=> {
    const {email, password, confirmPassword} = req.body;
    const userExists = await User.findOne({email});
    try {
        if(!email){
            errors.message = 'you must be provide an email'
            return res.status(400).redirect(req.path);
        };
        if(userExists){
            errors.message = 'email alredy exists'
            return res.status(400).redirect(req.path);
        }

        if(!password || !confirmPassword){
            errors.message = 'you must be privide an passwords'
            return res.status(400).redirect(req.path);
        }

        if(password.length < 8 && confirmPassword.length < 8){
            errors.message = 'password min length is 8 character'
            return res.status(400).redirect(req.path);
        };

        if(password !== confirmPassword){
            errors.message = 'passwords not same'
            return res.status(400).redirect(req.path);
        };

        const user = await User.create(req.body);
        req.session.isLogged = true;
        res.cookie('user', user);
        return res.status(201).redirect('/');
    } catch (error) {
        let errors = {};
        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
        } else if (error.code === 11000) {
            errors.email = 'Email already exists';
        } else {
            errors.message = error.message;
        }

        // Pass back the form data to preserve user input
        errors.message = 'user not added';
        return res.render('index', {
            errors
        });
    };
};


export const logOutAll = (req, res)=>{
    req.session.destroy(err => {
    if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).send('Error destroying session');
    }

    // Clear cookie after session destroyed
    res.clearCookie('connect.sid'); // default name unless you've customized it
    res.clearCookie('user');
    return res.status(301).redirect('/');
    });
}
