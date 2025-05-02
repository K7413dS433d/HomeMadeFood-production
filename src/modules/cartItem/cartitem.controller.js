import { Router } from "express";
import * as middlewares from '../../middleware/index.middlewares.js'
import * as constants from '../../common/constants/index.constant.js'
import * as utils from '../../utils/index.utils.js'
import * as cartItemService from './cartitem.service.js'
import * as cartItemSchema from './cartitem.validation.js'

const cartItemRouter = Router()
cartItemRouter.post('/add-meal',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN),
    middlewares.validateSchema(cartItemSchema.addMealToCart),
    utils.asyncHandler(cartItemService.addMealToCart)
)

cartItemRouter.delete('/delete-meal/:cartItemId/:mealId',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.USER),
    middlewares.validateSchema(cartItemSchema.deleteMeal),
    utils.asyncHandler(cartItemService.deleteMeal)
)

cartItemRouter.delete('/clear-cart',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.USER),
    utils.asyncHandler(cartItemService.clearCart)
)

cartItemRouter.get('/cart-items',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.USER),
    utils.asyncHandler(cartItemService.getCartItems)
)

cartItemRouter.put('/update-cart/:cartItemId/:mealId',
    middlewares.isAuthenticated(process.env.TOKEN_USER_VALUE),
    middlewares.isAuthorized(constants.roles.USER),
    middlewares.validateSchema(cartItemSchema.updateCartItem),
    utils.asyncHandler(cartItemService.updateCartItem)
)
export default cartItemRouter