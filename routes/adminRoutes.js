import expres from 'express';
import User from '../models/user.js';
import isAdminHelper, { isAdmin } from '../middleware/isAdmin.js';
import { getAllUsers, getEditUser, getProducts, updateUser } from '../conntrolers/adminController.js';
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

adminRouter.delete('/admin/user/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found!'
      });
    }

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
});


adminRouter.get('/admin/products', getProducts)

export default adminRouter;