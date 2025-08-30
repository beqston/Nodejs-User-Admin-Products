import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    price:{
        type: Number,
        required: [true, 'Price is required']
    },
    description:{
        type: String,
        reqired: [true, 'Description is required']
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
