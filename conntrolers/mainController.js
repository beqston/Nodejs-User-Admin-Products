import { errors } from "../utils/errorMessage.js";
import Product from '../models/product.js'
import User from '../models/user.js'
import { isLogged, stayPath } from "../middleware/isAuthHelper.js";
import { validationResult } from "express-validator";

import jwt  from "jsonwebtoken";
import fs from 'fs';
import sharp from "sharp";
import path from "path";
import nodemailer from "nodemailer";

const cart =[];

export const getHome = async(req, res)=> {

   if(isLogged){
        const id = req.cookies.user.id;
        const user = await User.findById(id);
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

export const postProduct = async (req, res) => {
  try {
    if (isLogged) {
      const userId = req.cookies.user.id;
      const { title, price, description  } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }

      if(!title || !price || !description){
        errors.message = 'title, price and description is required!'
        return res.status(204).redirect('/')
      }

        // Handle image upload (optional)
        let imagePath = '/photos/default_product.png';
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const filename = `${req.file.filename}-new${ext}`;
            const outputPath = path.join('uploads/products', filename);

            await sharp(req.file.path)
                .resize(120, 120)
                .toFile(outputPath);

            fs.unlinkSync(req.file.path); // Remove original
            imagePath = '/'+ outputPath;
        }

      const product = new Product({
        title,
        price,
        description,
        image:imagePath,
        user: userId
      });

      await product.save();

      // ✅ Push product ID only
      user.products.push(product._id);
      await user.save();

      return res.status(201).redirect('/products');
    }

    return res.status(401).send('Unauthorized');
  } catch (error) {
    return res.status(500).send('Internal server error: ' + error.message);
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

        if(!user){
            errors.message = 'User not found!'
            return res.status(400).redirect(stayPath);
        };

        const password = await user.comparePassword(req.body.password);
        if(!password){
            errors.message = 'Your password is incorect!!'
            return res.redirect('/login')
        }
        await User.findByIdAndUpdate(user._id, {
        isActive: true
    }, {
      new: true, // returns the updated document
      runValidators: true, // validates against the schema
    });
    req.session.isLogged = true;
    res.cookie('user', user);

    // generate token
    const token = jwt.sign(
        { id: user._id },
        process.env.TOKEN_SECRET,
        { expiresIn: '1h' }
    );
    res.cookie('token', token);
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
            user = await User.findById(userCookie.id);
        };
        const users = await User.find();
        const products = await Product.find();
        return res.status(200).render('products', {
            products, 
            errors, 
            isLogged, 
            user,
            users,
            title: 'All Products Page'
        });
    } catch (error) {
        return res.status(404).render('products', {error: 'error'})
    }
};

export const getSignUp = (req, res)=>{
    return res.status(200).render('signUp', {
        errors,
        title: 'Sign Up Page',
        reqBody: {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });
};

export const postSignUp = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    const errors = validationResult(req);

    // Handle validation errors from express-validator
    if (!errors.isEmpty()) {
        return res.status(400).render('signUp', {
            errors: { message: 'Please enter valid values!', details: errors.array() },
            title: 'Sign Up Page',
            reqBody: req.body
        });
    };

    try {
        // Manual field checks
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).render('signUp', {
                errors: { message: 'All fields are required.' },
                title: 'Sign Up Page',
                reqBody: req.body
            });
        }

        if (password.length < 8) {
            return res.status(400).render('signUp', {
                errors: { message: 'Password must be at least 8 characters long.' },
                title: 'Sign Up Page',
                reqBody: req.body
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).render('signUp', {
                errors: { message: 'Passwords do not match.' },
                title: 'Sign Up Page',
                reqBody: req.body
            });
        };

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render('signUp', {
                errors: { message: 'Email already exists.' },
                title: 'Sign Up Page',
                reqBody: req.body
            });
        }

        // Handle image upload (optional)
        let imagePath = '/photos/profile.png';
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const filename = `${req.file.filename}-new${ext}`;
            const outputPath = path.join('uploads/users', filename);

            await sharp(req.file.path)
                .resize(24, 24)
                .toFile(outputPath);

            fs.unlinkSync(req.file.path); // Remove original
            imagePath = '/'+ outputPath;
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            image: imagePath
        });

        // Set session and cookies
        req.session.isLogged = true;
        res.cookie('user', { id: user._id });

        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: '1h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).redirect('/');
    } catch (error) {
        const errorMessage = error.name === 'ValidationError'
            ? Object.values(error.errors).map(e => e.message).join(', ')
            : error.code === 11000
                ? 'Email already exists.'
                : error.message;

        return res.status(500).render('signUp', {
            errors: { message: 'User not added: ' + errorMessage },
            title: 'Sign Up Page',
            reqBody: req.body
        });
    }
};

export const logOutAll = async(req, res)=>{
    const userCookie = req.cookies.user;
    await User.findByIdAndUpdate(userCookie._id, {
        isActive: false
    }, {
      new: true, // returns the updated document
      runValidators: true, // validates against the schema
    });
    
    req.session.destroy(err => {
    if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).send('Error destroying session');
    };

    // Clear cookie after session destroyed
    res.clearCookie('sessionId'); // default name unless you've customized it
    res.clearCookie('user');
    res.clearCookie('token');
    return res.status(301).redirect('/');
    });
};

export const getProfile = async(req, res)=>{
  try {
    const {id} = req.params;
    const user = await User.findById(req.cookies.user.id);

    const userPosts = await Product.find({user:id});

    if(user && req.cookies.user && isLogged && req.cookies.user.id == id){
        return res.status(200).render('profile', {
            user, 
            isLogged,
            title: `User Profile | ${user.email}`,
            userPosts
        });
    }
    return res.status(401).send('<h1>User not found!</h1>');
  } catch (error) {
    return res.status(500).send(`<h1>Internal server error: ${error.message}</h1>`)
  }
};

export const getForgot = (req, res)=> {
    if(isLogged){
        return res.status(301).redirect('/');
    }
  return res.status(200).render('forgot', {
    errors, 
    isLogged,
    title: 'Forgot Password',
    sendMessage:''
});
};

export const getReset = async(req, res)=>{
    const {token} = req.params;
    const user = await User.findOne({token});
    if(isLogged){
        return res.status(301).redirect('/');
    }
    if(!user){
        return res.status(404).redirect('/404');
    };
    
    return res.render('reset', {
        errors, 
        isLogged,
        user,
        reqBody:'',
        title: 'Reset Password'
    })
}

export const getProduct = async(req, res)=>{
  try {

    const {id} = req.params;
    const users = await User.find();
    const product = await Product.findById(id);
    if(!product){
      return res.status(400).send('File Not Found!  <a href="/products">Back Products Page</a>');
    };

    const {username} = users.find(user=> user._id.toString() === product.user._id.toString());

    if(isLogged){
        const userCookie = req.cookies.user;
        const user = await User.findById(userCookie.id);
        return res.status(200).render('product', {
        isLogged,
        product,
        user,
        users,
        errors,
        username,
        title: `Product Item | ${product.title}`
    });
    };

    return res.status(200).render('product', {
        isLogged,
        product,
        errors,
        users,
        username,
        title: `Product Item | ${product.title}`
    });
    
  } catch (error) {
    return res.status(500).send('Interval server error');
  };
};

export const postForgot = async(req, res)=>{
  try {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(403).redirect('/forgot');
    };

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
          html: `<h1>Reset Paswword</h1><p><b><a href="http://localhost:4000/reset/${token}">Reset Password</a></b></p>`, // HTML clickable link
        });

      } catch (err) {
        console.error("Error while sending mail", err);
      }
    })();
    
    return res.status(200).render('forgot', {
        errors, 
        isLogged,
        title: 'Forgot Password',
        sendMessage: "You Can Reset Password From Email"
    });
    
  } catch (error) {
    return res.status(500).send('Internal server error')
  }
}

export const postReset = async(req, res)=>{
  const {password, confirmPassword }= req.body;
  const {token} = req.params;
  const user = await User.findOne({token});
  try {
    const errors = validationResult(req);
    // Handle validation errors from express-validator
    if (!errors.isEmpty()) {
      return res.status(400).render(stayPath, {
          errors: { message: 'Please enter valid values!', details: errors.array() },
          title: 'Sign Up Page',
          reqBody: req.body
      });
    };

    // Manual field checks
    if (!password || !confirmPassword) {
        return res.status(400).render('reset', {
            errors: { message: 'All fields are required!' },
            title: 'Sign Up Page',
            reqBody: req.body
        });
    }

    if (password.length < 8) {
        return res.status(400).render('signUp', {
            errors: { message: 'Password must be at least 8 characters long.' },
            title: 'Sign Up Page',
            reqBody: req.body
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).render('reset', {
            errors: { message: 'Passwords do not match.' },
            title: 'Sign Up Page',
            reqBody: req.body
        });
    };
    user.password = password;
    user.confirmPassword = confirmPassword;
    await user.save();

    return res.status(201).redirect('/');
  } catch (error) {
    return res.status(500).send('Interval Server Error!')
  }
}

export const getMyPoructs = async(req, res)=>{
    try {
        if(!isLogged){
            return res.status(204).redirect('/');
        };

        const user = await User.findById(req.cookies.user.id).populate('products');
        
        return res.status(200).render('myProducts', {
            isLogged,
            title:`${user.username}'s Products`,
            user
        })
    } catch (error) {
        return res.status(500).send('<h1>Interval server error!!!</h1>', error)
    }
}

export const getApiAllUsers = async(req, res)=>{
   try {
    const users = await User.find();
    if(!users){
        return res.status(200).json({
            status:'succses',
            data:[]
        })
    };
    return res.status(200).json({
        stattus:'suscess',
        data:users
    })
   } catch (error) {
    return res.status(500).json({
        status:'fail',
        message:'Interval server error!'
    })
   }
};

export const getApiAllProducts = async(req, res)=>{
   try {
    const products = await Product.find();
    if(!products){
        return res.status(200).json({
            status:'succses',
            data:[]
        })
    };
    return res.status(200).json({
        stattus:'suscess',
        data:products
    })
   } catch (error) {
    return res.status(500).json({
        status:'fail',
        message:'Interval server error!'
    })
   }
}

export const getCart = async (req, res)=>{
    const users = await User.find();
     if(isLogged){
        const id = req.cookies.user.id;
        const user = await User.findById(id);
        return res.status(200).render('cart', {
        isLogged,
        user,
        title: 'Cart List',
        cart,
        users
    });
   }
    return res.status(200).render('cart', {
        isLogged,
        title:'Home Page',
        cart,
        users
    });
}

export const addToCart = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).send("Product not found");
    }

    const existingItem = cart.find(item => item.product._id.toString() === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            quantity: 1,
            product
        });
    }

    return res.status(302).redirect(stayPath);
};


export const deleteFromCart = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).send("Product not found");
    }

    // Filter out the product from the cart
    const filteredCart = cart.filter(item => item.product._id.toString() !== id);
    cart.length = 0;
    cart.push(...filteredCart);
    return res.status(200)
};
