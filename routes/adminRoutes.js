import expres from 'express';
import isAdminHelper, { isAdmin } from '../middleware/isAdmin.js';
import { deleteProduct, deleteUser, deleteUserImage, getAllUsers, getEditProduct, getEditUser, getProducts, updateProduct, updateUser } from '../conntrolers/adminController.js';
import upload from '../utils/multer.js';

const adminRouter = expres.Router();

adminRouter.use(async(req, res, next)=>{
    await isAdminHelper(req);
    if(isAdmin){
        return next()
    }
    return res.status(401).redirect('/');
});

const updateUserImage = upload('users');
const updateProductImage = upload('products');

// crup operator admin panel users 
adminRouter.get('/admin/users', getAllUsers);
adminRouter.route('/admin/user/:id/edit')
  .get(getEditUser)
  .patch(updateUserImage.single('image'), updateUser);

adminRouter.delete('/admin/user/delete/image/:id', deleteUserImage);
adminRouter.delete('/admin/user/:id/delete', deleteUser);


// crud operator admin panel products 
adminRouter.get('/admin/products', getProducts)
adminRouter.route('/admin/product/:id/edit')
  .get(getEditProduct)
  .patch(updateProductImage.single('image'), updateProduct);
adminRouter.delete('/admin/product/:id/delete', deleteProduct);


export default adminRouter;