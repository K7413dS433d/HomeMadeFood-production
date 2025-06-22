import { model, Schema } from "mongoose";
import * as constants from '../../../common/constants/index.constant.js'

// schema
export const orderSchema = new Schema({
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
    cartItem:
    {
        type: Schema.ObjectId,
        ref: 'CartItem',
        required: [true, "CartItem ID is required."]
    },
    status: {
        type: String,
        enum: Object.values(constants.orderStatus),
        default: constants.orderStatus.ORDERED,
        required: [true, "Order status is required."]
    },
    deliveryAddress: {
        locationId: {
            type: Schema.ObjectId,
            ref: 'Location'
        },
        address: { type: String },
        longitude: { type: String },
        latitude: { type: String }
    },
    subtotal: {
        type: Number,
        min: [0, "Order price must be greater than or equal to 0"],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: Object.values(constants.paymentMethod),
        default: constants.paymentMethod.VISA,
        rquired: [true, "Payment method is required."]
    },
    deliveryFee:{
        type: Number,
        min: [0, "Delivery fee must be greater than or equal to 0"],
        default: 0
    },
    serviceFee:{
        type: Number,
        min: [0, "Service fee must be greater than or equal to 0"],
        default: 0
    },
    total:{
        type: Number,
        min: [0, "Total price must be greater than or equal to 0"],
        required: true
    },
    acceptedAt: {
        type: Date
    },
    deliveredAt: {    
        type: Date
    },
}, { timestamps: true })

// model
const Order = model('Order', orderSchema)

export default Order