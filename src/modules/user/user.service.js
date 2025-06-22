import { image } from "../../common/constants/index.constant.js";
import models from "./../../DB/models/index.models.js";
import * as utils from "./../../utils/index.utils.js";
import * as constants from "./../../common/constants/index.constant.js";
import ApiFeatures from "../../utils/api-features/api-features.js";

//update profile for user
export const updateUserProfile = async (req, res, next) => {
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

//update profile for chef
export const updateChefProfile = async (req, res, next) => {
  const { user } = req;

  const {
    firstName,
    lastName,
    phone,
    displayName,
    description,
    facebookPageLink,
    instagramPageLink,
    kitchenAddress,
    openSchedule,
  } = req.body;

  if (firstName) user.firstName = firstName;

  if (lastName) user.lastName = lastName;

  if (phone) user.phone = phone;

  if (displayName) user.displayName = displayName;

  if (description) user.description = description;

  if (facebookPageLink) user.facebookPageLink = facebookPageLink;

  if (instagramPageLink) user.instagramPageLink = instagramPageLink;

  if (kitchenAddress) user.kitchenAddress = kitchenAddress;

  if (openSchedule) user.openSchedule = openSchedule;

  if (req.file) {
    //folder to save profile picture
    const profileDir = utils.pathResolver({ path: `Chefs/${user.id}` });

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
        "Account already deleted login in 30 days to restore it",
        409
      )
    );

  user.deletedAt = Date.now();

  //delete account image
  if (user.image.public_id != image.public_id)
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

//get your profile
export const getProfile = async (req, res, next) => {
  const { id } = req.user;
  const chef = await models.User.findById(id).select(
    "-password -authProvider -deletedAt -verified -role -termsAccepted"
  );

  return res
    .status(200)
    .json({ success: true, message: "successfully", data: chef });
};

//get chef profile
export const getChefProfile = async (req, res, next) => {
  const { chefId } = req.params;

  const chef = await models.User.findById(chefId).select(
    "-password -phone -authProvider -deletedAt -verified -termsAccepted -kitchenAddress"
  );

  //check if chef is exist and not deleted
  if (!chef || chef.deletedAt)
    return next(new utils.AppError("Chef not found", 404));

  if (chef.role != constants.roles.CHEF)
    return next(
      new utils.AppError("Access denied cannot get user profile", 400)
    );
  chef.role = undefined;

  return res
    .status(200)
    .json({ success: true, message: "successfully", data: chef });
};

//follow unfollow chef
export const chefFollowing = async (req, res, next) => {
  const { user } = req;
  const { chefId } = req.params;

  //check if chef id not equal to user id
  if (user.id == chefId)
    return next(new utils.AppError("You cannot follow yourself", 409));

  //check if the chef is exist
  const chef = await models.User.findById(chefId);
  if (!chef) return next(new utils.AppError("Chef not found", 404));

  //check if the chef is deleted
  if (chef.deletedAt)
    return next(new utils.AppError("Cannot follow Deleted accounts", 400));

  //check if the chef is a chef
  if (chef.role != constants.roles.CHEF)
    return next(
      new utils.AppError("Currently this is account in user mode", 404)
    );

  let message = "";
  //check if the chef is already in favorites
  if (user.followedChefs.includes(chefId)) {
    //remove chef from favorites
    user.followedChefs = user.followedChefs.filter(
      (chef) => chef.toString() != chefId
    );
    message = "Chef removed from following successfully";
  } else {
    //add chef to following
    user.followedChefs.push(chefId);
    message = "Chef followed successfully";
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message,
    data: {
      followedChefs: user.followedChefs,
    },
  });
};

//get user following
export const getUserFollowing = async (req, res, next) => {
  const { user } = req;

  //get all followed chefs
  const allChefs = await models.User.find({
    _id: { $in: user.followedChefs },
    deletedAt: { $exists: false },
  }).select(
    "-password -phone -authProvider -deletedAt -verified -role -termsAccepted"
  );
  const chefsWithDelivery = await utils.isDelivers({
    userId: user.id,
    allChefs,
  });
  const chefsWithRate = await utils.calcRate({ allChefs });
  const mergedChefs = await utils.mergeChefData({
    chefsWithRate,
    chefsWithDelivery,
  });
  return res.status(200).json({
    success: true,
    message: "successfully",
    data: {
      mergedChefs,
    },
  });
};

export const getAllChefs = async (req, res, next) => {
  const { page = 1, limit = 4 } = req.query;
  const userId = req.user.id;

  // Count total documents before pagination
  const totalCount = await models.User.countDocuments({
    role: constants.roles.CHEF,
    deletedAt: { $exists: false },
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  const apiFeature = new ApiFeatures(
    models.User.find({
      role: constants.roles.CHEF,
      deletedAt: { $exists: false },
    }).select(
      "description image displayName firstName lastName kitchenAddress"
    ),
    req.query
  )
    .search("firstName", "lastName", "displayName", "description")
    .pagination()
    .fields();
  const allChefs = await apiFeature.mongooseQuery;
  const chefsWithDelivery = await utils.isDelivers({ userId, allChefs });
  const chefsWithRate = await utils.calcRate({ allChefs });
  const mergedChefs = await utils.mergeChefData({
    chefsWithRate,
    chefsWithDelivery,
  });

  res.status(200).json({
    success: true,
    message: "successfully",
    data: mergedChefs,
    pagination: {
      totalCount,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
    },
  });
};
