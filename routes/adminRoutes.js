import expres from 'express';
import User from '../models/user.js';
import isAdminHelper, { isAdmin } from '../middleware/isAdmin.js';
import { deleteUser, getAllUsers, getEditUser, getProducts, updateUser } from '../conntrolers/adminController.js';
import upload from '../utils/multer.js';

const adminRouter = expres.Router();

adminRouter.use(async(req, res, next)=>{
    await isAdminHelper(req);
    if(isAdmin){
        return next()
    }
    return res.status(401).redirect('/');
});

adminRouter.get('/admin/users', getAllUsers);
const uploadImage = upload('users')
adminRouter.route('/admin/user/:id/edit')
  .get(getEditUser)
  .patch(uploadImage.single('image'), updateUser);

adminRouter.delete('/admin/user/:id/delete',deleteUser);


adminRouter.get('/admin/products', getProducts)

export default adminRouter;