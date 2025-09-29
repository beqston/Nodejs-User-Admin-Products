import User from "../models/user.js";
import { isLogged } from "./isAuthHelper.js";

export let isAdmin = false;
async function isAdminHelper(req){
    if(isLogged){
        const user = await User.findById(req.cookies.user._id);
        if(user.role === 'admin'){
            isAdmin = true;
        }
    }
}

export default isAdminHelper;