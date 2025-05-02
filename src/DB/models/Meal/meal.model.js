import { model, Schema, Types, Decimal128 } from "mongoose";
import * as constants from "../../../common/constants/index.constant.js";
import { deleteMealImages } from "./meal.hook.js";

//schema
const mealSchema = new Schema(
  {
    chef: { type: Types.ObjectId, required: true },

    name: { type: String, required: true },

    description: { type: String, required: true },

    size: {
      type: String,
      enum: Object.values(constants.mealSize),
      required: true,
    },

    spiceLevel: {
      type: String,
      enum: Object.values(constants.mealSpiceLevel),
      required: true,
    },

    tags: String,

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
  { timestamps: true }
);

mealSchema.pre("deleteOne", { document: true, query: false }, deleteMealImages);

//model
const Meal = model("Meal", mealSchema);

export default Meal;
