import User from "../models/user.js";
import Product from '../models/product.js'
import { isLogged } from "../middleware/isAuthHelper.js";
import { errors } from "../utils/errorMessage.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllUsers = async (req, res)=>{
    const users = await User.find();
    try {
        const user = await User.findById(req.cookies.user._id);
            return res.status(200).render('admin/users', {
            users,
            isLogged,
            title:'All Users Admin Page',
            user
        })
    } catch (error) {
        return res.status(500).send('Interval server errorr!')
    }
}

export const getProducts = async(req, res)=> {
    try {
        const user = await User.findById(req.cookies.user.id);
        const users = await User.find();
        const products = await Product.find();
        return res.status(200).render('admin/products', {
            products, 
            errors, 
            isLogged, 
            user,
            users,
            title: 'All Products Page'
        });
    } catch (error) {
        return res.status(404).render('admin/products', {error: 'error'})
    }
};
export const getEditUser = async(req, res)=>{
    const users = await User.find();
    try {
        const {id} = req.params;
        const user = await User.findById(req.cookies.user._id);
        const editUser = await User.findById(id);
        return res.status(200).render('admin/editUser', {
            users,
            isLogged,
            title:  `Edit User -${editUser.username}`,
            user,
            editUser,
            errors,
        })

    } catch (error) {
        return res.status(500).send('Interval server errorr!',  error)
    }
}


export const updateUser = async (req, res) => {
    const { id } = req.params;
    
    try {
      // Create update object with only the fields that were provided
      const updateData = { ...req.body };
      
      // If password is being updated, make sure it matches confirmPassword
      if (updateData.password) {
          if (updateData.password !== updateData.confirmPassword) {
              return res.status(400).json({
                  status: "fail",
                  message: "Passwords do not match"
              });
          }
          // Remove confirmPassword as we don't need to store it
          delete updateData.confirmPassword;
      } else {
          // If password is not being updated, remove it from the update data
          delete updateData.password;
          delete updateData.confirmPassword;
      }

      // Handle file upload if present
      if (req.file) {
          updateData.image = '/uploads/users/' + req.file.filename; // Store the file path
      }

      const user = await User.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true
      });

      if (!user) {
          return res.status(404).json({
              status: "fail",
              message: "User not found"
          });
      }

      // Return success response
      return res.status(201).json({
          status: "success",
          data: user
      });

  } catch (error) {
      console.error('Error updating user:', error);
      res.status(400).json({
          status: "fail",
          message: error.message || "Error updating user"
      });
  }
}

export const deleteUser =  async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found!'
      });
    }
    const imagePath = path.join(__dirname, '../', deleteUser.image)
    if(fs.existsSync(imagePath)){
      fs.unlinkSync(imagePath);
    }

    await Product.deleteMany({ user: id });

    // If this is an API call from fetch, do NOT redirect.
    return res.status(202).json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

export const deleteUserImage =  async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const imagePath = path.join(__dirname, '../', user.image)
    
    if(fs.existsSync(imagePath)){
      fs.unlinkSync(imagePath);
      // Optionally reset image field
        user.image = '/photos/profile.png';
        await user.save();
    }

    // return res.status(202).redirect('/admin/user/'+id+'/edit');
    return res.json({
      message:"You Delete Profile Image"
    })
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error!');
  }
}

export const getEditProduct = async (req, res)=>{
    const {id} = req.params;
     try {
        const product = await Product.findById(id);
        if(!product){
            return res.status(404).json({
                status:"fail",
                message:'User not found!!'
            })
        };

        const user = await User.findById(req.cookies.user._id);
        
        return res.status(200).render('admin/editProduct', {
            product,
            isLogged,
            user,
            title:`Edit Product - ${product.title}`,
            errors
        })
     } catch (error) {
        return res.status(500).send('Interval server error!')
     }
}


export const updateProduct = async (req, res)=>{
  const {id} = req.params;
  try {
      const updateData = {...req.body};
      
      if(req.file){
        updateData.image = '/uploads/products/' + req.file.filename; // Store the file path
      };

      const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });

      if(!product){
        return res.status(404).json({
          status:'fail',
          message:'Product not found!'
        })
      };

      return res.status(200).json({
        status:'succses',
        data: product
      })
    } catch (err) {
      return res.status(500).send('<h1>Interval server error!</h1>')
    }
}


export const deleteProduct =  async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await Product.findByIdAndDelete(id);

    if (!deleteProduct) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found!'
      });
    }

    const imagePath = path.join(__dirname, '../', deleteProduct.image)
    
    if(fs.existsSync(imagePath)){
      fs.unlinkSync(imagePath);
    }
    // If this is an API call from fetch, do NOT redirect.
    return res.status(202).json({
      status: 'success',
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}