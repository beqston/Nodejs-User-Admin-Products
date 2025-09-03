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
        message: 'role must be user or admin'
    },
    default: 'user'
    }, 
    products: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }
    ]
    

},{
    toJSON:{virtuals:true},
    toObject: {virtuals:true}
});

// Index for faster queries on email
userSchema.index({ email: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password =  await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;