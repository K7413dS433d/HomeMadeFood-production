import { Router } from "express";
import * as middlewares from '../../middleware/index.middlewares.js'
import * as constants from '../../common/constants/index.constant.js'
import * as utils from '../../utils/index.utils.js'
import * as cartItemService from './cartitem.service.js'
import * as cartItemSchema from './cartitem.validation.js'

const cartItemRouter = Router()
cartItemRouter.post('/add-meal',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN, constants.roles.CHEF),
    middlewares.validateSchema(cartItemSchema.addMealToCart),
    utils.asyncHandler(cartItemService.addMealToCart)
)

cartItemRouter.delete('/delete-meal/:cartItemId/:mealId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER),
    middlewares.validateSchema(cartItemSchema.deleteMeal),
    utils.asyncHandler(cartItemService.deleteMeal)
)

cartItemRouter.delete('/clear-cart',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER),
    utils.asyncHandler(cartItemService.clearCart)
)

cartItemRouter.get('/cart-items',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER),
    utils.asyncHandler(cartItemService.getCartItems)
)
cartItemRouter.get('/cart-item/:cartItemId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER),
    utils.asyncHandler(cartItemService.getCartItem)
)

cartItemRouter.put('/update-cart/:cartItemId/:mealId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER),
    middlewares.validateSchema(cartItemSchema.updateCartItem),
    utils.asyncHandler(cartItemService.updateCartItem)
)
cartItemRouter.put('/checkout/:cartItemId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER),
    utils.asyncHandler(cartItemService.checkoutCartItem)
)
export default cartItemRouter