import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Title is required'],
    },
    price:{
        type: Number,
        required: [true, 'Price is required']
    },
    description:{
        type: String,
        trim:true,
        reqired: [true, 'Description is required']
    },
    image:{
        type:String,
        default:'/photos/default_product.png',
        set: v => v && v.trim() !== '' ? v : '/photos/default_product.png'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    toJSON:{virtuals:true},
    toObject: {virtuals:true}
});


const Product = mongoose.model('Product', productSchema);

export default Product;
