import axios from "axios";
import FormData from "form-data";
import models from "./../../DB/models/index.models.js";
import ApiFeatures from "../../utils/api-features/api-features.js";
import * as utils from "../../utils/index.utils.js";
import { Types } from "mongoose";

//new meal
export const addMeal = async (req, res, next) => {
  const { user } = req;

  //create meal to get its id
  const newMeal = new models.Meal({ ...req.body, chef: user.id });

  // chef meal Directory
  const mealDir = utils.pathResolver({
    path: `Chefs/${user.id}/meals/${newMeal.id}`,
  });

  //upload patch images
  const mealsImages = await utils.uploadFiles({
    req,
    options: { folder: mealDir },
  });

  //set images in meal
  newMeal.images = mealsImages;

  //save the meal
  await newMeal.save();

  return res.status(201).json({
    success: true,
    message: "meal created Successfully",
    data: {
      meal: newMeal,
    },
  });
};

//update chef meal
export const updateMeal = async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;
  const {
    name,
    description,
    size,
    spiceLevel,
    tags,
    category,
    price,
    hiddenStatus,
    stock,
  } = req.body;

  //check meal exist
  const mealExist = await models.Meal.findById(id).select(
    "-reviews -favoriteBy"
  );
  if (!mealExist) return next(new utils.AppError("Meal not exist", 404));

  //check authorized chef
  if (mealExist.chef.toString() != user.id)
    return next(new utils.AppError("Unauthorized to change this meal", 401));

  //check for updates
  if (name) mealExist.name = name;
  if (description) mealExist.description = description;
  if (size) mealExist.size = size;
  if (spiceLevel) mealExist.spiceLevel = spiceLevel;
  if (tags) mealExist.tags = tags;
  if (category) mealExist.category = category;
  if (price) mealExist.price = price;
  if (hiddenStatus != undefined) mealExist.hiddenStatus = hiddenStatus;
  if (stock != undefined) {
    mealExist.stock = stock;
    if (stock <= 0) mealExist.hiddenStatus = true;
  }
  if (req.files.length) {
    // chef meal Directory
    const mealDir = utils.pathResolver({
      path: `Chefs/${user.id}/meals/${mealExist.id}`,
    });

    //delete old images
    const oldPublicIds = mealExist.images.map((img) => img.public_id);
    await utils.deleteCloudDir({ assetsArray: oldPublicIds, dir: false });

    //upload new images
    const mealsImages = await utils.uploadFiles({
      req,
      options: { folder: mealDir },
    });

    //set images in meal
    mealExist.images = mealsImages;
  }

  //save the updated meal
  await mealExist.save();

  return res.status(200).json({
    success: true,
    message: "Meal updated successfully",
    data: {
      meal: mealExist,
    },
  });
};

// delete meal
export const deleteMeal = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;

  //check meal is exist
  const mealExist = await models.Meal.findById(id);
  if (!mealExist) return next(new utils.AppError("Meal not exist", 404));

  //check authorized chef
  if (mealExist.chef.toString() != user.id)
    return next(new utils.AppError("Unauthorized to delete this meal", 401));

  //delete meal
  await mealExist.deleteOne();

  return res.status(200).json({
    success: true,
    message: "meal deleted successfully",
    data: {
      meal: mealExist,
    },
  });
};

//get all chef meals
export const getAllChefMeals = async (req, res, next) => {
  const { user } = req;
  const { page = 1, limit = 5 } = req.query;

  // Create query for chef's meals
  const query = models.Meal.find({ chef: user.id });

  // Count total documents before pagination
  const totalCount = await models.Meal.countDocuments({ chef: user.id });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Api features instance - using the original implementation
  const apiFeature = new ApiFeatures(
    query.populate({
      path: "reviews",
      match: { isDeleted: { $ne: true } }, // Only populate non-deleted reviews
      select: "-meal",
      populate: { path: "user", select: "firstName lastName image" },
    }),
    req.query
  ).pagination();

  // Call api with feature
  const allMeals = await apiFeature.mongooseQuery;
  return res.status(200).json({
    success: true,
    message: "successfully",
    data: allMeals,
    pagination: {
      currentPage: parseInt(page),
      limit: parseInt(limit),
      totalCount,
      totalPages,
    },
  });
};

//add meal to fav
export const addMealToFav = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;

  //check meal exist
  const mealExist = await models.Meal.findById(id);
  if (!mealExist) return next(new utils.AppError("Meal not found", 404));

  //check meal is in the favorite
  const mealIdx = user.favoriteMeals.indexOf(mealExist.id);

  if (mealIdx > -1)
    return next(new utils.AppError("Meal already in your favorites", 409));

  //add meal to user
  user.favoriteMeals.push(mealExist.id);
  mealExist.favoriteBy.push({ user: user.id, addedAt: Date() });

  //save both
  await Promise.all([user.save(), mealExist.save()]);

  return res.status(200).json({
    success: true,
    message: `Meal ${mealExist.name} added to favorite `,
  });
};

//get favorite meals
export const getFavoriteMeals = async (req, res, next) => {
  const { user } = req;
  const favMeals = await models.Meal.find({
    _id: { $in: user.favoriteMeals },
  })
    .populate([
      { path: "chef", select: "firstName lastName image" },
      {
        path: "reviews",
        select: "-meal",
        populate: { path: "user", select: "firstName lastName image" },
      },
    ])
    .select("-favoriteBy -id");

  return res.status(200).json({
    success: true,
    message: "Favorite meals retrieved successfully",
    data: favMeals,
  });
};

// remove meal from fav
export const removeMealFromFav = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;

  //check meal exist
  const mealExist = await models.Meal.findById(id);

  if (!mealExist) return next(new utils.AppError("Meal not found", 404));

  //check meal is in the favorite
  const mealIdx = user.favoriteMeals.indexOf(mealExist.id);

  if (mealIdx == -1)
    return next(new utils.AppError("Meal not in your favorites", 409));

  //remove meal from user
  user.favoriteMeals.splice(mealIdx, 1);

  //remove user from meal
  const favBy = mealExist.favoriteBy.filter(
    (v) => v.user.toString() != user.id
  );
  mealExist.favoriteBy = favBy;

  //save both
  await Promise.all([user.save(), mealExist.save()]);

  return res.status(200).json({
    success: true,
    message: `Meal ${mealExist.name} removed from your favorites`,
  });
};

//! get all meals without aggregation
// export const getAllMeals = async (req, res, next) => {
//   //api features instance
//   const apiFeature = new ApiFeatures(
//     models.Meal.find().populate({ path: "reviews", select: "rate" }),
//     req.query
//   )
//     .search("name", "description")
//     .filter("category", "chef")
//     .pagination();

//   //call api with feature
//   const allMeals = await apiFeature.mongooseQuery.select("-password");
//     allMeals = allMeals.map((meal) => {
//     const obj = meal.toObject(); // to trigger virtuals
//     delete obj.reviews;
//     return obj;
//   });

//   return res
//     .status(200)
//     .json({ success: true, message: "successfully", data: allMeals });
// };

//!get all meals aggregation

//get all meals with aggregation
export const getAllMeals = async (req, res, next) => {
  const { page = 1, limit = 5, search = "", category, chef } = req.query;

  const matchStage = {};

  // Search logic
  if (search) {
    matchStage.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filter logic
  if (category) matchStage.category = category;
  if (chef) matchStage.chef = new Types.ObjectId(chef);

  const pipeline = [
    {
      $match: {
        hiddenStatus: false,
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }),
        ...(category && { category }),
        ...(chef && { chef: new Types.ObjectId(chef) }),
      },
    },
    {
      $lookup: {
        from: "reviews",
        let: { mealId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$meal", "$$mealId"] },
                  { $not: ["$isDeleted"] }, // filter out deleted reviews
                ],
              },
            },
          },
        ],
        as: "reviews",
      },
    },
    {
      $addFields: {
        avgRating: {
          $cond: [
            { $eq: [{ $size: "$reviews" }, 0] },
            0,
            { $avg: "$reviews.rate" },
          ],
        },
      },
    },
    {
      $project: {
        reviews: 0,
        password: 0,
      },
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ];

  const meals = await models.Meal.aggregate(pipeline);

  // Create a count pipeline to get the total number of meals matching the criteria
  const countPipeline = [
    {
      $match: {
        hiddenStatus: false,
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }),
        ...(category && { category }),
        ...(chef && { chef: new Types.ObjectId(chef) }),
      },
    },
    {
      $count: "totalCount",
    },
  ];

  const countResult = await models.Meal.aggregate(countPipeline);
  const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  return res.status(200).json({
    success: true,
    message: "successfully",
    data: meals,
    pagination: {
      currentPage: parseInt(page),
      limit: parseInt(limit),
      totalCount,
      totalPages,
    },
  });
};

export const getSimilarMeals = async (req, res, next) => {
  const file = req.file;
  if (!file) return next(new utils.AppError("No image uploaded.", 400));

  const formData = new FormData();
  formData.append("file", file.path);

  const response = await axios.post(process.env.URL_SEARCH_BY_IMAGE, formData, {
    ...formData.getHeaders(),
  });

  const similarMealIds = response.data.similar_meal_ids;
  const similarMeals = await models.Meal.find({ _id: { $in: similarMealIds } });
  if (similarMeals.length == 0)
    return next(new utils.AppError("No similar meals found", 404));

  return res.status(200).json({
    success: true,
    message: "Image processed successfully",
    data: similarMeals,
  });
};
