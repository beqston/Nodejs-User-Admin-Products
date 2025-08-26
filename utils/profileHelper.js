import User from "../models/user.js";
import { isLogged } from "./isAuthHelper.js";

export let userInfo = {};

export const userProfile = async (req)=> {
    const user = await User.findOne({email:req.cookies.user.email});
    if(isLogged && req.cookies.user.id == user.id){
        userInfo = user;
    }else{
        userInfo = {};
    }
};