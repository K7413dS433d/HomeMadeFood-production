import { Schema, model } from "mongoose";

//schema
const cartSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, "User is required."],
        unique: true
    },
    cartItems: [
        {
            type: Schema.ObjectId,
            ref: 'CartItem'
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    }
    
}, { timestamps: true })

// model
const Cart = model('Cart', cartSchema)
export default Cart