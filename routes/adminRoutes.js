import expres from 'express';
import User from '../models/user.js';
import isAdminHelper, { isAdmin } from '../middleware/isAdmin.js';
import { deleteUser, getAllUsers, getEditUser, getProducts, updateUser } from '../conntrolers/adminController.js';
import upload from '../utils/multer.js';


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const adminRouter = expres.Router();

adminRouter.use(async(req, res, next)=>{
    await isAdminHelper(req);
    if(isAdmin){
        return next()
    }
    return res.status(401).redirect('/');
});

const updateUserImage = upload('users');
adminRouter.get('/admin/users', getAllUsers);
adminRouter.route('/admin/user/:id/edit')
  .get(getEditUser)
  .patch(updateUserImage.single('image'), updateUser);

// adminRouter.route('/admin/product/:id/edit')
//   .get(getEditProduct)
//   .patch(uploadImage.single('image'), updateUser);


adminRouter.delete('/admin/user/delete/image/:id', async (req, res) => {
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
});

adminRouter.delete('/admin/user/:id/delete', deleteUser);


adminRouter.get('/admin/products', getProducts)

export default adminRouter;