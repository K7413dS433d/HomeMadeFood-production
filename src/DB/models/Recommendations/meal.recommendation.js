import { Schema, model } from "mongoose";

const userRecommendationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required."]
    },
    meals: [
        {
            mealId: {
                type: Schema.Types.ObjectId,
                ref: 'Meal',
                required: [true, "Meal is required."]
            },
            category: { type: String },
            images: [
                {
                    secure_url: { type: String, required: true },
                    public_id: { type: String, required: true },
                },
            ],
            avgRating: { type: Number },
            stock: { type: Number, default: 0 },
            favoriteBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
        }
    ]
});

const User_Recommendation = model('User_Recommendation', userRecommendationSchema);

export default User_Recommendation;
