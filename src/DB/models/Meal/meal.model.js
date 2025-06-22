import { model, Schema, Types } from "mongoose";
import * as constants from "../../../common/constants/index.constant.js";
import { deleteMealImages } from "./meal.hook.js";
import { calcAvgRating } from "./meal.method.js";

//schema
const mealSchema = new Schema(
  {
    chef: { type: Types.ObjectId, required: true, ref: "User" },

    name: { type: String, required: true },

    description: { type: String, required: true },

    hiddenStatus: { type: Boolean, default: true },

    stock: {
      type: Number,
      required: true,
      min: [0, "Stock must be greater than or equal to 0"],
    },

    category: {
      type: String,
      enum: Object.values(constants.mealCategory),
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price must be greater than or equal to 0"],
    },

    images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    reviews: [{ type: Types.ObjectId, ref: "Review" }],

    favoriteBy: [
      {
        user: { type: Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//meal avg rate
mealSchema.virtual("avgRating").get(calcAvgRating);

mealSchema.pre("deleteOne", { document: true, query: false }, deleteMealImages);

//model
const Meal = model("Meal", mealSchema);

export default Meal;
