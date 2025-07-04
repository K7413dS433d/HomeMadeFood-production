import { Router } from "express";
import * as middlewares from "../../middleware/index.middlewares.js";
import * as constants from '../../common/constants/index.constant.js'
import * as utils from '../../utils/index.utils.js'
import * as reviewService from './review.service.js'
import * as reviewSchema from './review.validation.js'

const reviewRouter = Router()

reviewRouter.post('/add-review/:mealId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN),
    middlewares.validateSchema(reviewSchema.addReview),
    utils.asyncHandler(reviewService.addReview))

reviewRouter.get('/get-user-reviews/:mealId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN),
    utils.asyncHandler(reviewService.getUserReviews))

reviewRouter.get('/get-user-review/:reviewId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN),
    middlewares.validateSchema(reviewSchema.getUserReview),
    utils.asyncHandler(reviewService.getUserReview))

reviewRouter.delete('/delete-review/:reviewId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN),
    middlewares.validateSchema(reviewSchema.deleteReview),
    utils.asyncHandler(reviewService.deleteReview))

reviewRouter.get('/get-meal-reviews/:mealId',
    middlewares.isAuthenticated(process.env.BEARER_KEY),
    middlewares.isVerified,
    middlewares.isAuthorized(constants.roles.USER, constants.roles.ADMIN),
    middlewares.validateSchema(reviewSchema.getMealReviews),
    utils.asyncHandler(reviewService.getMealReviews))

export default reviewRouter