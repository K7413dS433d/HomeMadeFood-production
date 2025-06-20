import { model, Schema, Types } from "mongoose";

//schema
const locationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User" },

    addressName: {
      type: String,
      required: true,
      minLength: [2, "Address name must be  2-15 characters."],
      maxLength: [30, "Address name must be  2-15 characters."],
    },

    address: { type: String },

    longitude: { type: String, required: true },

    latitude: { type: String, required: true },

    default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

//model
const Location = model("Location", locationSchema);

export default Location;
