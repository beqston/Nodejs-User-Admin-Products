import expres from 'express';
import User from '../models/user.js';
import { isLogged } from '../middleware/isAuthHelper.js';
import isAdminHelper, { isAdmin } from '../middleware/isAdmin.js';

const adminRouter = expres.Router();

const reqBody= {};
adminRouter.use(async(req, res, next)=>{
    await isAdminHelper(req);
    if(isAdmin){
        return next()
    }
    return res.status(401).redirect('/');
});

adminRouter.get('/admin/users', async (req, res)=>{
    const users = await User.find();
    try {

        if(isLogged){
        const user = await User.findById(req.cookies.user._id);
        if(user.role === 'admin'){
            return res.status(200).render('admin/users', {
            users,
            isLogged,
            title:'All Users Admin Page',
            user,
            reqBody
        })
        };
        return res.status(401).redirect('/');
    };

    } catch (error) {
        return res.status(500).send('Interval server errorr!')
    }
});

adminRouter.route('/admin/user/:id').post(async(req, res)=>{
    const users = await User.find();
    try {

        if(isLogged){
        const user = await User.findById(req.cookies.user._id);
        if(user.role === 'admin'){
            return res.status(200).render('admin/users', {
            users,
            isLogged,
            title:'All Users Admin Page',
            user
        })
        };
        return res.status(401).redirect('/');
    };

    } catch (error) {
        return res.status(500).send('Interval server errorr!',  error)
    }
})


export default adminRouter;