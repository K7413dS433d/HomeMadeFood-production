import joi from "joi";
import * as constants from '../../common/constants/index.constant.js'

// add order schema
export const createOrder = joi.object({
    // params
    cartItemId: joi.string().required(),

    // body
    locationId: joi.string().optional(),
    address: joi.string().when('locationId', {
        is: joi.exist(),
        then: joi.forbidden(),
        otherwise: joi.required()
    }),
    longitude: joi.string().when('locationId', {
        is: joi.exist(),
        then: joi.forbidden(),
        otherwise: joi.required()
    }),
    latitude: joi.string().when('locationId', {
        is: joi.exist(),
        then: joi.forbidden(),
        otherwise: joi.required()
    }),
    paymentMethod: joi.string().valid(...Object.values(constants.paymentMethod)).required()
}).required()

// cancel order schema 
export const cancelOrder = joi.object({
    // params
    orderId: joi.string().required()
}).required()

// update order status schema
export const updateOrderStatus = joi.object({
    // body
    status: joi.string().valid(...Object.values(constants.orderStatus)).required(),

    // params
    orderId: joi.string().required()
}).required()

// get specific order schema
export const getUserOrder = joi.object({
    // params
    orderId: joi.string().required()
}).required()

// get all orders schema
export const getAllOrders = joi.object({
    // query
    status: joi.string().valid(...Object.values(constants.orderStatus)),
    paymentMethod: joi.string().valid(...Object.values(constants.paymentMethod)),
    user: joi.string()
})
