import { errors } from "../utils/errorMessage.js";
import Product from '../models/product.js'
import User from '../models/user.js'
import { isLogged, stayPath } from "../utils/isAuthHelper.js";


export const getHome = async(req, res)=> {

   if(isLogged){
        const userCookie = req.cookies.user;
        const user = await User.findById(userCookie._id);
        return res.status(200).render('index', {
        errors,
        isLogged,
        user,
        title: 'Home Page'
    });
   }
    return res.status(200).render('index', {
        errors,
        isLogged,
        title:'Home Page'
    });
};

export const postProduct = async (req, res)=>{
  try {
    if(isLogged){
      const userId = req.cookies.user.id; 
      const { title, price, description } = req.body;
      const product = await Product.create({
        title,
        price,
        description,
        user: userId
      });
      
      if(!product){
        throw new Error('Canntot added product');
      }
      return res.status(201).redirect('/products')
    }

  } catch (error) {
    return res.status(500).send('Interval sevrver error', + error.message)
  }
};

export const getLogin = (req, res)=>{
    if(isLogged){
        return res.status(401).redirect('/');
    }
    return res.status(200).render('login', {
        errors, 
        isLogged, 
        title: 'Login Page'
    });
};

export const postLogin = async(req, res)=>{
    try {
        const user = await User.findOne({email:req.body.email}).select('+password');
        const password = await user.comparePassword(req.body.password);
        if(!password){
            errors.message = 'Your password is incorect!!'
            return res.redirect('/login')
        }
        req.session.isLogged = true;
        res.cookie('user', user);
        return res.status(201).redirect(stayPath);
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
};


export const getProducts = async(req, res)=> {
    try {
        let user;
        if(isLogged){
            const userCookie = req.cookies.user;
            user = await User.findById(userCookie._id);
        }
        const products = await Product.find();
        return res.status(200).render('products', {
            products, 
            errors, 
            isLogged, 
            user,
            title: 'All Products Page'
        });
    } catch (error) {
        return res.status(404).render('products', {error: 'error'})
    }
};

export const getSignUp = (req, res)=>{
    return res.status(200).render('signUp', {
        errors,
        title: 'Sign Up Page'
    });
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
};

export const getProfile = async(req, res)=>{
  try {
    const {id} = req.params;
    const user = await User.findOne({email:req.cookies.user.email});

    if(user && req.cookies.user && isLogged && req.cookies.user.id == id){
        return res.status(200).render('profile', {
            user, 
            isLogged,
            title: `User Profile | ${user.email}`
        });
    }
    return res.status(401).send('<h1>User not found!</h1>');
  } catch (error) {
    return res.status(500).send(`<h1>Internal server error: ${error.message}</h1>`)
  }
};
export const getForgot = (req, res)=> {
  res.status(200).render('forgot', {
    errors, 
    isLogged,
    title: 'Forgot Password'
});
};

export const getReset = (req, res)=>{
    return res.render('reset', {
        errors, 
        isLogged,
        title: 'Reset Password'
    })
}

export const getProduct = async(req, res)=>{
  try {
    const userCookie = req.cookies.user;
    const user = await User.findById(userCookie._id);
    const {id} = req.params;
    const product = await Product.findById(id);
    if(!product){
      return res.status(400).send('File Not Found!  <a href="/products">Back Products Page</a>');
    };

    return res.status(200).render('product', {
      isLogged,
      product,
      user,
      title: `Product Item | ${product.title}`
    });
    
  } catch (error) {
    return res.status(500).send('Interval server error');
  };
};