import mongoose from "mongoose";
import moment from "moment";
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
    user.kitchenStatus = constants.kitchenStatus.OPEN;
    if (!user.paymentMethod) {
      user.displayName = req.body.displayName;
      user.description = req.body.description;
      user.kitchenAddress = req.body.kitchenAddress;
      user.openSchedule = req.body.openSchedule;
      user.paymentMethod = req.body.paymentMethod;
      user.termsAccepted = req.body.termsAccepted;
      user.kitchenStatus = constants.kitchenStatus.OPEN;
      if (req.body.facebookPageLink)
        user.facebookPageLink = req.body.facebookPageLink;
      if (req.body.instagramPageLink)
        user.instagramPageLink = req.body.instagramPageLink;
    }
  } else if (user.role == constants.roles.CHEF) {
    user.role = constants.roles.USER;
    user.kitchenStatus = constants.kitchenStatus.CLOSED;
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

  const defaultLocation = await models.Location.findOne({
    userId: id,
    default: true,
  }).select("addressName longitude latitude");
  if (!defaultLocation)
    return next(new utils.AppError("Default location not found", 404));

  return res.status(200).json({
    success: true,
    message: "successfully",
    data: { chef, defaultLocation },
  });
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

  const totalCount = await models.User.countDocuments({
    role: constants.roles.CHEF,
    deletedAt: { $exists: false },
  });

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

export const topSellingMealsForChef = async (req, res, next) => {
  const chefId = req.user.id;
  const topSellingMeals = await models.Order.aggregate([
    {
      $match: {
        status: constants.orderStatus.DELIVERED,
        chef: new mongoose.Types.ObjectId(chefId),
        createdAt: {
          $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
    },

    {
      $lookup: {
        from: "cartitems",
        localField: "cartItem",
        foreignField: "_id",
        as: "cartItem",
      },
    },
    { $unwind: "$cartItem" },
    {
      $match: {
        "cartItem.chef": new mongoose.Types.ObjectId(chefId),
      },
    },
    { $unwind: "$cartItem.meals" },
    {
      $group: {
        _id: "$cartItem.meals.mealId",
        totalSold: { $sum: "$cartItem.meals.quantity" },
        lastOrderDate: { $max: "$createdAt" },
      },
    },
    {
      $sort: { totalSold: -1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "meals",
        localField: "_id",
        foreignField: "_id",
        as: "meal",
      },
    },
    {
      $unwind: "$meal",
    },

    {
      $lookup: {
        from: "reviews",
        localField: "meal._id",
        foreignField: "meal",
        as: "reviews",
      },
    },
    {
      $addFields: {
        avgRating: {
          $let: {
            vars: {
              validReviews: {
                $filter: {
                  input: "$reviews",
                  as: "review",
                  cond: { $eq: ["$$review.isDeleted", false] },
                },
              },
            },
            in: {
              $cond: [
                { $gt: [{ $size: "$$validReviews" }, 0] },
                { $avg: "$$validReviews.rate" },
                0,
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        label: { $literal: "Top of the Last Month" },
        _id: 0,
        mealId: "$_id",
        name: "$meal.name",
        totalSold: 1,
        avgRating: 1,
        price: "$meal.price",
        lastOrderDate: {
          $dateToString: { format: "%H:%M:%S", date: "$lastOrderDate" },
        },
        image: { $arrayElemAt: ["$meal.images.secure_url", 0] },
      },
    },
  ]);
  if (!topSellingMeals || topSellingMeals.length === 0) {
    return next(new utils.AppError("No data found for this chef", 404));
  }
  topSellingMeals.forEach((meal, index) => {
    meal.rank = index + 1;
  });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedMeals = topSellingMeals.slice(startIndex, endIndex);
  return res.status(200).json({
    success: true,
    message: "Top selling meals fetched successfully",
    data: paginatedMeals,
    pagination: {
      currentPage: page,
      limit,
    },
  });
};

export const pendingOrders = async (req, res, next) => {
  const chefId = req.user.id;
  const pendingOrders = await models.Order.aggregate([
    {
      $match: {
        chef: new mongoose.Types.ObjectId(chefId),
        status: constants.orderStatus.ORDERED,
      },
    },
    {
      $lookup: {
        from: "cartitems",
        localField: "cartItem",
        foreignField: "_id",
        as: "cartItem",
      },
    },
    { $unwind: "$cartItem" },
    {
      $unwind: "$cartItem.meals",
    },
    {
      $lookup: {
        from: "meals",
        localField: "cartItem.meals.mealId",
        foreignField: "_id",
        as: "mealData",
      },
    },
    {
      $unwind: "$mealData",
    },
    {
      $group: {
        _id: "$_id",
        createdAt: { $first: "$createdAt" },
        user: { $first: "$user" },
        meals: {
          $push: {
            quantity: "$cartItem.meals.quantity",
            meal: {
              name: "$mealData.name",
              price: "$mealData.price",
              image: { $arrayElemAt: ["$mealData.images.secure_url", 0] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        mealsCount: { $size: "$meals" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $addFields: {
        lastOrderHour: {
          $let: {
            vars: {
              hour: { $hour: { date: "$createdAt", timezone: "UTC" } },
            },
            in: {
              $cond: [
                { $eq: ["$$hour", 0] },
                12,
                {
                  $cond: [
                    { $gt: ["$$hour", 12] },
                    { $subtract: ["$$hour", 12] },
                    "$$hour",
                  ],
                },
              ],
            },
          },
        },
        lastOrderMinute: {
          $toString: {
            $minute: { date: "$createdAt", timezone: "UTC" },
          },
        },
        amPm: {
          $cond: [
            {
              $lt: [{ $hour: { date: "$createdAt", timezone: "UTC" } }, 12],
            },
            "AM",
            "PM",
          ],
        },
      },
    },
    {
      $addFields: {
        orderTime: {
          $concat: [
            { $toString: "$lastOrderHour" },
            ":",
            {
              $cond: [
                { $lt: [{ $strLenCP: "$lastOrderMinute" }, 2] },
                { $concat: ["0", "$lastOrderMinute"] },
                "$lastOrderMinute",
              ],
            },
            " ",
            "$amPm",
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
        orderTime: 1,
        mealsCount: 1,
        cartItem: {
          meals: "$meals",
        },
        user: {
          fullName: {
            $concat: ["$user.firstName", " ", "$user.lastName"],
          },
          image: "$user.image.secure_url",
        },
      },
    },
  ]);

  if (!pendingOrders || pendingOrders.length === 0) {
    return next(
      new utils.AppError("No pending orders found for this chef", 404)
    );
  }
  return res.status(200).json({
    success: true,
    message: "Pending orders fetched successfully",
    data: pendingOrders,
  });
};

export const salesOverview = async (req, res, next) => {
  const chefId = req.user.id;
  const filter = req.query.filter || constants.salesOverview.ALL_TIME;
  let matchStage = {
    chef: new mongoose.Types.ObjectId(chefId),
    status: {
      $in: [
        constants.orderStatus.DELIVERED,
        constants.orderStatus.CANCELED,
        constants.orderStatus.ORDERED,
      ],
    },
  };

  if (filter !== constants.salesOverview.ALL_TIME) {
    const now = moment().endOf("day");
    let start;

    switch (filter) {
      case constants.salesOverview.TODAY:
        start = moment().startOf("day");
        break;
      case constants.salesOverview.WEEKLY:
        start = moment().startOf("isoWeek");
        break;
      case constants.salesOverview.MONTHLY:
        start = moment().startOf("month");
        break;
      case constants.salesOverview.YEARLY:
        start = moment().startOf("year");
        break;
    }

    matchStage.createdAt = {
      $gte: start.toDate(),
      $lte: now.toDate(),
    };
  }

  const result = await models.Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        sales: {
          $sum: {
            $cond: [
              { $eq: ["$status", constants.orderStatus.DELIVERED] },
              "$total",
              0,
            ],
          },
        },
        orders: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [
              { $eq: ["$status", constants.orderStatus.DELIVERED] },
              1,
              0,
            ],
          },
        },
        canceled: {
          $sum: {
            $cond: [{ $eq: ["$status", constants.orderStatus.CANCELED] }, 1, 0],
          },
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$status", constants.orderStatus.ORDERED] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        incomes: {
          $subtract: [
            "$sales",
            {
              $add: [
                {
                  $multiply: ["$sales", 0.05],
                },
                50,
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        sales: 1,
        incomes: 1,
        orders: 1,
        completed: 1,
        canceled: 1,
        pending: 1,
      },
    },
  ]);
  if (!result || result.length === 0) {
    return next(
      new utils.AppError(`There are no sales recorded for ${filter} `, 404)
    );
  }
  return res.status(200).json({
    success: true,
    message: "Sales overview fetched successfully",
    data: result,
  });
};

export const displayOrUpdateStatus = async (req, res, next) => {
  const { user } = req;
  const { kitchenStatus } = req.body;
  const chefStatus = await models.User.findById(user.id);
  if (kitchenStatus) {
    chefStatus.kitchenStatus = kitchenStatus;
    await chefStatus.save();
  }
  return res.status(200).json({
    success: true,
    message: `Kitchen status is ${chefStatus.kitchenStatus} now`,
    data: { status: chefStatus.kitchenStatus },
  });
};

//chefs near of you
export const chefsNearYou = async (req, res, next) => {
  const { page = 1, limit = 4 } = req.query;
  const { user } = req;
  const apiFeature = new ApiFeatures(
    models.User.find({
      role: constants.roles.CHEF,
      deletedAt: { $exists: false },
    }).select(
      "description image displayName firstName lastName kitchenAddress"
    ),
    req.query
  ).pagination();

  const allChefs = await apiFeature.mongooseQuery;
  const chefsWithDelivery = await utils.isDelivers({
    userId: user.id,
    allChefs,
  });
  const chefsWithRate = await utils.calcRate({ allChefs });
  const mergedChefs = await utils.mergeChefData({
    chefsWithRate,
    chefsWithDelivery,
  });

  const chefsNearOfYou = mergedChefs.filter((chef) => chef.delivers);
  // console.log(chefsNearOfYou)

  if (chefsNearOfYou.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No nearby chefs found",
    });
  }
  if (chefsNearOfYou[0].delivers === "please enter your location") {
    return res.status(400).json({
      success: false,
      message: "Please set your location to find nearby chefs",
    });
  }
  const totalCount = chefsNearOfYou.length;
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  return res.status(200).json({
    success: true,
    message: "Nearby chefs fetched successfully",
    data: chefsNearOfYou,
    pagination: {
      totalCount,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
    },
  });
};
