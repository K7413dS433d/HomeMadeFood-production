import models from "../../DB/models/index.models.js"
import * as utils from "../../utils/index.utils.js"
import * as constants from '../../common/constants/index.constant.js'


export const addReview = async (req, res, next) => {
        const { mealId } = req.params;
        const { comment, rate } = req.body;

        const mealExists = await models.Meal.findById(mealId);
        if (!mealExists) {
            return next(new utils.AppError('Meal is not found.', 404));
        }

        const cartItemIds = await models.Order
            .find({
                user: req.user._id,
                status: constants.orderStatus.DELIVERED,
            })
            .distinct('cartItem');

        if (cartItemIds.length === 0) {
            return next(
                new utils.AppError(
                    'You must have purchased this product and it must be delivered to leave a review.',
                    403
                )
            );
        }


        const purchased = await models.CartItem.find({
            _id: { $in: cartItemIds },
            'meals.mealId': mealId,
        });

        if (purchased.length === 0) {
            return next(
                new utils.AppError(
                    'You must have purchased this product and it must be delivered to leave a review.',
                    403
                )
            );
        }
    const review = await models.Review.findOneAndUpdate(
        { user: req.user._id, meal: mealId, isDeleted: false },
        { comment, rate },
        { new: true }
    ).populate({
        path: 'user',
        select: 'firstName lastName image'
    });

    if (review) {
        return res.status(200).json({
            success: true,
            message: 'Review updated successfully.',
            data: review,
        });
    }

    // Create new review
    const newReview = await models.Review.create({
        user: req.user._id,
        meal: mealId,
        comment,
        rate,
    });

    // Add review to meal
    await models.Meal.findByIdAndUpdate(mealId, {
        $push: { reviews: newReview._id },
    });

    // Populate user data after creation
    const populatedReview = await models.Review.findById(newReview._id).populate({
        path: 'user',
        select: 'firstName lastName image',
    });

    return res.status(201).json({
        success: true,
        message: 'Review added successfully.',
        data: populatedReview,
    });
}
// user can delete a review
export const deleteReview = async (req, res, next) => {
    // get data.
    const { reviewId } = req.params

    // check review existence.
    const reviewExist = await models.Review.findById(reviewId)
    if (!reviewExist) return next(new utils.AppError("Review is not found.", 404))

    // check if user own this review
    if (reviewExist.user.toString() != req.user._id.toString()) return next(new utils.AppError("Unauthorized", 401))

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
    const { mealId } = req.params;

    // Check if meal exists
    const mealExist = await models.Meal.findById(mealId);
    if (!mealExist) return next(new utils.AppError("Meal is not found.", 404));

    // Get the user's review for the specific meal
    const review = await models.Review.findOne({ 
        user: req.user._id, 
        meal: mealId, 
        isDeleted: false 
    }).populate({
        path: 'user',
        select: 'firstName lastName image'
    })
    if (!review) return next(new utils.AppError("No review by this user on the specified meal.", 404));

    return res.status(200).json({ 
        success: true, 
        message: "User review found.", 
        data: review 
    });
}
// user can get any review related to him
export const getUserReview = async (req, res, next) => {
    const { reviewId } = req.params;

    const review = await models.Review.findOne({
        _id: reviewId,
        user: req.user._id,
        isDeleted: false
    }).populate({
        path: 'user',
        select: 'firstName lastName image'
    });

    if (!review) {
        return next(new utils.AppError("Review not found or you're not authorized.", 404));
    }

    return res.status(200).json({
        success: true,
        message: "User review retrieved successfully.",
        data: review
    });
};

// user can get all meal reviews.
export const getMealReviews = async (req, res, next) => {
    const { mealId } = req.params;

    const mealDoc = await models.Meal.findById(mealId)
        .populate({
            path: "reviews",
            match: { isDeleted: false },
            select: "rate",
        })
        .select("name images");

    if (!mealDoc) {
        return next(new utils.AppError("Meal not found.", 404));
    }

    const meal = mealDoc.toObject({ virtuals: true });

    delete meal.reviews;

    const reviews = await models.Review.find({ meal: mealId, isDeleted: false })
        .populate({
            path: "user",
            select: "firstName lastName image",
        })
        .sort({ createdAt: -1 })
        .select("-isDeleted -deletedAt -__v -meal");

    return res.status(200).json({
        success: true,
        message: "Meal reviews retrieved successfully.",
        results: reviews.length,
        data: {
            meal,
            reviews,
        },
    });
}
