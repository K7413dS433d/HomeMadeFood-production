import joi from 'joi'

// add review schema
export const addReview = joi.object({
    // body
    comment: joi.string().required(),
    rate: joi.number().min(0).max(5),

    // params
    mealId: joi.string().required()
}).required()


// delete review schema
export const deleteReview = joi.object({
    // params
    reviewId: joi.string().required()
}).required()

// get all reviews schema
export const getMealReviews = joi.object({
    // params
    mealId: joi.string().required()
}).required()

// get user reviews schema
export const getUserReview = joi.object({
    // params
    reviewId: joi.string().required()
})