import { Router } from "express";
import * as utils from '../../utils/index.utils.js'
import * as middlewares from '../../middleware/index.middlewares.js'
import * as orderService from './order.service.js'
import * as orderSchema from './order.validation.js'
import * as constants from '../../common/constants/index.constant.js'

const orderRouter = Router()
orderRouter.post('/create-order/:cartItemId',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN),
    middlewares.validateSchema(orderSchema.createOrder),
    utils.asyncHandler(orderService.createOrder))

orderRouter.get('/get-user-orders',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.USER),
    utils.asyncHandler(orderService.getUserOrders))

orderRouter.get('/get-user-order/:orderId',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN),
    middlewares.validateSchema(orderSchema.getUserOrder),
    utils.asyncHandler(orderService.getUserOrder))

orderRouter.delete('/cancel-order/:orderId',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN),
    middlewares.validateSchema(orderSchema.cancelOrder),
    utils.asyncHandler(orderService.cancelOrder))

orderRouter.get('/all-orders',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.ADMIN),
    middlewares.validateSchema(orderSchema.getAllOrders),
    utils.asyncHandler(orderService.getAllOrders))

orderRouter.put('/update-order/:orderId',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.ADMIN, constants.roles.CHEF, constants.roles.DELIVERY),
    middlewares.validateSchema(orderSchema.updateOrderStatus),
    utils.asyncHandler(orderService.updateOrderStatus))

export default orderRouter