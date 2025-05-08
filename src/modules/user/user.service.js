import { image } from "../../common/constants/index.constant.js";
import models from "./../../DB/models/index.models.js";
import * as utils from "./../../utils/index.utils.js";
import * as constants from "./../../common/constants/index.constant.js";

//update profile
export const updateProfile = async (req, res, next) => {
  const { user } = req;

  const { firstName, lastName, language, phone } = req.body;

  if (firstName) user.firstName = firstName;

  if (lastName) user.lastName = lastName;

  if (language) user.accountLanguage = language;

  if (phone) user.phone = phone;

  if (req.file) {
    //folder to save profile picture
    const profileDir = utils.pathResolver({ path: `Users/${user.id}` });

    //upload file
    const image = await utils.uploadFile({
      req,
      options: { folder: profileDir, fileName: "profilePic" },
    });

    //add image
    user.image = image;
  }

  //save user
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user },
  });
};

//update email
export const updateEmail = async (req, res, next) => {
  const { user } = req;
  const { newEmail } = req.body;

  //update confirmation and email
  user.verified = false;
  user.email = newEmail;

  // create otp
  const otp = utils.generateOTP();

  //save otp in db
  await models.OTP.create({ email: newEmail, otp });

  //send otp to user
  utils.emailEmitter.emit("sendEmail", { email: newEmail, otp });

  //save user
  await user.save();

  return res.status(200).json({
    success: true,
    message: "OTP sent to the new email please confirm your email",
  });
};

//delete account
export const deleteAccount = async (req, res, next) => {
  const { user } = req;

  if (user.deletedAt)
    return next(
      new utils.AppError(
        "Account already deleted login in 30 days to restore it ",
        409
      )
    );

  user.deletedAt = Date.now();

  //delete account image
  await utils.deleteCloudDir({ assetsArray: [user.image.public_id] });

  //set account image to default
  user.image.public_id = image.public_id;
  user.image.secure_url = image.secure_url;

  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Account deleted successfully" });
};

//change password
export const changePassword = async (req, res, next) => {
  const { user } = req;
  const { newPassword, oldPassword } = req.body;

  if (
    !utils.comparPassword({
      password: oldPassword,
      hashPassword: user.password,
    })
  )
    return next(new utils.AppError("Wrong password", 401));

  //change password
  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
};

//switch mode
export const switchRole = async (req, res, next) => {
  const { user } = req;
  if (user.role == constants.roles.USER) {
    user.role = constants.roles.CHEF;
    if (!user.paymentMethod) {
      user.displayName = req.body.displayName;
      user.description = req.body.description;
      user.kitchenAddress = req.body.kitchenAddress;
      user.openSchedule = req.body.openSchedule;
      user.paymentMethod = req.body.paymentMethod;
      user.termsAccepted = req.body.termsAccepted;
      if (req.body.facebookPageLink)
        user.facebookPageLink = req.body.facebookPageLink;
      if (req.body.instagramPageLink)
        user.instagramPageLink = req.body.instagramPageLink;
    }
  } else if (user.role == constants.roles.CHEF) {
    user.role = constants.roles.USER;
  }
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Role changed successfully",
    data: { user },
  });
};
