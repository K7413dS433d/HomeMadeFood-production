import mongoose, { Schema } from "mongoose";
import * as constants from "../../../common/constants/index.constant.js";

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [constants.EMAIL_REG, "Enter a valid email address."],
    },
    otp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
