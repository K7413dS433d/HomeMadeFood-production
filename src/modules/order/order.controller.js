import { Router } from "express";
import * as utils from '../../utils/index.utils.js'
import * as middlewares from '../../middleware/index.middlewares.js'
import * as orderService from './order.service.js'
import * as orderSchema from './order.validation.js'
import * as constants from '../../common/constants/index.constant.js'

const orderRouter = Router()

orderRouter.get('/get-user-orders',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER),
    utils.asyncHandler(orderService.getUserOrders))

orderRouter.get('/get-order-details/:orderId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER, constants.roles.CHEF),
    middlewares.validateSchema(orderSchema.getOrderDetails),
    utils.asyncHandler(orderService.getOrderDetails))

orderRouter.get('/get-full-order/:orderId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER, constants.roles.CHEF),
    middlewares.validateSchema(orderSchema.getFullOrder),
    utils.asyncHandler(orderService.getFullOrder))

orderRouter.delete('/cancel-order/:orderId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER, constants.roles.CHEF),
    middlewares.validateSchema(orderSchema.cancelOrder),
    utils.asyncHandler(orderService.cancelOrder))

orderRouter.get('/get-chef-orders',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.CHEF),
    middlewares.validateSchema(orderSchema.getChefOrders),
    utils.asyncHandler(orderService.getChefOrders))

orderRouter.put('/accept-order/:orderId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.CHEF),
    middlewares.validateSchema(orderSchema.acceptOrder),
    utils.asyncHandler(orderService.acceptOrder))

orderRouter.put('/update-order/:orderId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.CHEF),
    middlewares.validateSchema(orderSchema.updateOrderStatus),
    utils.asyncHandler(orderService.updateOrderStatus))

export default orderRouter