import models from "../../DB/models/index.models.js"
import * as utils from "../../utils/index.utils.js"
import * as constants from '../../common/constants/index.constant.js'

// user can add a new review or update an existing one
export const addReview = async (req, res, next) => {
    // get data.
    const { mealId } = req.params
    const { comment, rate } = req.body
    
    // check meal existence.
    const mealExist = await models.Meal.findById(mealId).lean()
    if (!mealExist) return next(new utils.AppError("Meal is not found.", 404))

    // check if user has orderd this meal.
    const orderExist = await models.Order.findOne({
        user: req.user._id,
        status: constants.orderStatus.DELIVERED
    }).populate({
        path: 'cartItem',
        select: 'meals'
    }).lean()

    // check if meal exist in the cartitem of the order
    const mealExistInOrder = orderExist?.cartItem?.meals.some(meal => meal.mealId.toString() === mealId.toString())
    if (!orderExist || !mealExistInOrder) return next(new utils.AppError("You must have purchased this product and it must be deliverd to you to leave a review.", 403))

    // check if user has reviewed on this  meal before.
    const reviewExist = await models.Review.findOneAndUpdate({ user: req.user._id, meal: mealId }, { comment, rate }, { new: true })
    if (!reviewExist) {
        // create new review
        const review = await models.Review.create({ user: req.user._id, meal: mealId, comment, rate })
        if (!review) return next(new utils.AppError("Failed to create review.", 500))

        // add review to meal.    
        await models.Meal.findByIdAndUpdate(mealId, { $push: { reviews: review._id } })

        return res.status(201).json({ success: true, message: "Review added successfully.", data: review })
    }
    return res.status(200).json({ success: true, message: "Review updated successfully.", data: reviewExist })
}
// user can delete a review
export const deleteReview = async (req, res, next) => {
    // get data.
    const { reviewId } = req.params

    // check review existence.
    const reviewExist = await models.Review.findById(reviewId)
    if (!reviewExist) return next(new utils.AppError("Review is not found.", 404))
    
    // check if user own this review
    if(reviewExist.user.toString() != req.user._id.toString()) return next(new utils.AppError("Unauthorized", 401))    

    // Check if review is already deleted.
    if (reviewExist.isDeleted) {
        return next(new utils.AppError("This review is already deleted.", 400));
    }
    // update review info.
    reviewExist.isDeleted = true
    reviewExist.deletedAt = new Date();

    await reviewExist.save()
    return res.status(200).json({ success: true, message: 'Review deleted successfully.' })
}
// user can get all his reviews
export const getUserReviews = async (req, res, next) => {

    // check if user has reviews.
    const reviews = await models.Review.find({ user: req.user._id, isDeleted: false }).lean()
    if (reviews.length == 0) return next(new utils.AppError("This user has no reviews.", 404))

    return res.status(200).json({ success: true, message: "All user reviews are ", data: reviews })
}
// user can get any review related to him
export const getUserReview = async (req, res, next) => {
    // get data.
    const { reviewId } = req.params

    // check review existence.
    const reviewExist = await models.Review.findById(reviewId)
    if (!reviewExist) return next(new utils.AppError("Review is not found.", 404))

    if (reviewExist.user.toString() != (req.user._id).toString()) {
        return next(new utils.AppError("Unauthorized", 403))
    }
    return res.status(200).json({ success: true, message: "User Review is ", data: reviewExist })
}
// only the admin can get all reviews.
export const getAllReviews = async (req, res, next) => {
    const { rate, isDeleted, user } = req.query

    let filter = {}
    if (rate) filter.rate = rate
    if (isDeleted) filter.isDeleted = isDeleted
    if (user) filter.user = user

    const reviews = await models.Review.find(filter)
    if (reviews.length == 0) return next(new utils.AppError("There are no existing reviews.", 404))

    return res.status(200).json({ success: true, message: "All reviews are ", data: reviews })

}