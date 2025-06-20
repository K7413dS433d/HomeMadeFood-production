import { model, Schema } from "mongoose";
import { calcTotalPrice } from "./cartitem.hooks.js";

// schema
const cartItemSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, "User is required."]
    },
    chef: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, "Chef is required."]
    },
    meals: [
        {
            mealId: {
                type: Schema.ObjectId,
                ref: 'Meal',
                required: [true, "Meal is required."]
            },
            quantity: {
                type: Number,
                min: [1, "Quantity must be greater than or equal to 1."],
                default: 1
            },
            price:{
                type: Number,
                required: [true, 'Meal price is required.']
            }
        }
    ],
    totalPrice: {
        type: Number
    },
    isCheckedOut:{
        type: Boolean,
        default: false
    }
}, { timestamps: true })

//  calculate totalPrice automatically
cartItemSchema.pre('save', calcTotalPrice);

// model
const CartItem = model('CartItem', cartItemSchema)
export default CartItem