import joi from "joi";
import * as constants from "../../common/constants/index.constant.js";

// add order schema
export const createOrder = joi
  .object({
    // params
    cartItemId: joi.string().required(),

    // body
    locationId: joi.string().optional(),
    address: joi.string().when("locationId", {
      is: joi.exist(),
      then: joi.forbidden(),
      otherwise: joi.required(),
    }),
    longitude: joi.string().when("locationId", {
      is: joi.exist(),
      then: joi.forbidden(),
      otherwise: joi.required(),
    }),
    latitude: joi.string().when("locationId", {
      is: joi.exist(),
      then: joi.forbidden(),
      otherwise: joi.required(),
    }),
    paymentMethod: joi
      .string()
      .valid(...Object.values(constants.paymentMethod))
      .required(),
  })
  .required();

// cancel order schema
export const cancelOrder = joi
  .object({
    // params
    orderId: joi.string().required(),
  })
  .required();

// update order status schema
export const updateOrderStatus = joi
  .object({
    // body
    status: joi
      .string()
      .valid(...Object.values(constants.orderStatus))
      .required(),

    // params
    orderId: joi.string().required(),
  })
  .required();

// get specific order schema
export const getOrderDetails = joi
  .object({
    // params
    orderId: joi.string().required(),
  })
  .required();

// get full order
export const getFullOrder = joi
  .object({
    // params
    orderId: joi.string().required(),
  })
  .required();

// get chef orders schema
export const getChefOrders = joi
  .object({
    filter: joi
      .string()
      .valid(...Object.values(constants.salesOverview))
      .optional(),
    name: joi.string().optional(),
    status: joi
      .string()
      .valid(...Object.values(constants.orderStatus))
      .optional(),
    skip: joi.number().integer().min(0).default(0),
    limit: joi.number().integer().min(1).default(10),
  })
  .required();

// accept order schema
export const acceptOrder = joi
  .object({
    // params
    orderId: joi.string().required(),
  })
  .required();
