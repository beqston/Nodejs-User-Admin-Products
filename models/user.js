import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'you have must be email'],
        trim: true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: [true, 'you have must be password'],
        minlength: [8, "Password must be at least 8 characters"],
        trim: true,
        select: false
    },
    confirmPassword:{
        type: String,
        validate : {
           validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    role:{
    type:String,
    enum: {
        values: ['user', 'admin' ],
        message: 'rolemast be user or admin'
    },
    default: 'user'
    },
},{
    autoCreate:false,
    toJSON:{virtuals:true},
    toObject: {virtuals:true}
});


userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password =  await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});


const User = mongoose.model('User', userSchema);
export default User;