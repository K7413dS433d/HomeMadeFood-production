import models from "../../DB/models/index.models.js";
import * as utils from "../index.utils.js";

export const createOtp = async ({ email }) => {
  const otpExist = await models.OTP.findOne({ email });
  if (otpExist) {
    const currentTime = new Date();
    const otpCreatedAt = new Date(otpExist.createdAt);
    const timeDifference = Math.abs(currentTime - otpCreatedAt);
    const timeDifferenceInSeconds = Math.floor(timeDifference / 1000);
    if (timeDifferenceInSeconds < 60) {
      throw new utils.AppError(
        "Please wait 60 seconds before requesting a new OTP",
        429
      );
    }
    await models.OTP.deleteOne({ email });
  }
  const otp = utils.generateOTP();
  utils.emailEmitter.emit("sendEmail", { email, otp });

  await models.OTP.create({ email, otp: utils.encrypt({ data: otp }) });
};
