import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'you have must be title'],
    },
    price:{
        type: Number,
        required: [true, 'you have must be price']
    },
    description:{
        type: String,
        reqired: [true, 'you have must be description']
    }
});


const Product = mongoose.model('Product', productSchema);

export default Product;
