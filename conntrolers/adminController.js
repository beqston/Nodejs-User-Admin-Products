import User from "../models/user.js";
import { isLogged } from "../middleware/isAuthHelper.js";
import { errors } from "../utils/errorMessage.js";



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
          updateData.image = '/uploads/' + req.file.filename; // Store the file path
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
      res.json({
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

