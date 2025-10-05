import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from 'validator';

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      unique: true,
      minlength: [4, "Name cannot exceed 4 characters"],
      maxlength: [32, "Name cannot exceed 32 characters"],
    },
    email: {
        type: String,
        required: [true, 'you have must be email'],
        trim: true,
        unique: true,
        lowercase: true,
        validate:{
            validator: validator.isEmail,
            message:'Please provide a valid email address"'
        }
    },
    password:{
        type: String,
        required: [true, 'you have must be password'],
        select: false,
        validate:{
            validator: function(value){
            // Require at least one uppercase, lowercase, number, and special character
            return /[0-9A-Za-z]/.test(value);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        }
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
    image:{
        type:String,
        default:'/photos/profile.png'
    },
    role:{
    type:String,
    enum: {
        values: ['user', 'admin' ],
        message: 'role must be user or admin'
    },
        default: 'user'
    }, 
    token: String,
    products: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            validate: {
                validator:mongoose.Types.ObjectId.isValid,
                message:'Invalid product ID'
            }
        }
    ],
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    

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

// hashed password after update user
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 12);
    this.setUpdate(update);
  }
    // Optional: delete confirmPassword if it's passed in the update
    if (update.confirmPassword) {
      delete update.confirmPassword;
    }
  next();
});

// Validate ObjectId references before saving
userSchema.pre('save', async function(next){
  if (this.products && this.products.length > 0) {
    const invalid = this.products.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalid.length > 0) {
      return next(new Error('Invalid product IDs provided'));
    }
  }
  next(); // <-- Always call next if no error
});

// pre hook to delete products
userSchema.pre('findOneAndDelete', async function(next) {
  try {
    const filter = this.getFilter();
    console.log("User delete filter:", filter);

    const user = await this.model.findOne(filter);
    console.log("User found:", user);

    if (user) {
      const result = await mongoose.model('Product').deleteMany({ user: user._id });
      console.log(`Deleted ${result.deletedCount} products.`);
    }

    next();
  } catch (err) {
    console.error("Error in findOneAndDelete hook:", err);
    next(err);
  }
});

const User = mongoose.model('User', userSchema);
export default User;