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
export const getAllReviews = joi.object({
    // query
    rate: joi.number().min(0).max(5),
    isDeleted: joi.boolean(),
    user: joi.string()
})

// get user reviews schema
export const getUserReview = joi.object({
    // params
    reviewId: joi.string().required()
})