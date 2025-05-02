import { model, Schema } from "mongoose";

// schema
const reviewSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, "User is required."]
    },
    meal: {
        type: Schema.ObjectId,
        ref: 'Meal',
        required: [true, "Meal is required."]
    },
    comment: {
        type: String,
        required: [true, "Comment is required."]
    },
    rate: {
        type: Number,
        min: [0, "Rate must be greater than or equal to 0"],
        max: [5, "Rate must be less than or equal to 5"]
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// model
const Review = model('Review', reviewSchema)

export default Review