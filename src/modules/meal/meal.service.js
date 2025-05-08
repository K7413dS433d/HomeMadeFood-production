import axios from "axios";
import FormData from "form-data";
import models from "./../../DB/models/index.models.js";
import ApiFeatures from "../../utils/api-features/api-features.js";
import * as utils from "../../utils/index.utils.js";

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
  const { name, description, size, spiceLevel, tags, category, price } =
    req.body;

  //check meal exist
  const mealExist = await models.Meal.findById(id);
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

// get all chef meals
export const getAllChefMeals = async (req, res, next) => {
  const { user } = req;

  //api features instance
  const apiFeature = new ApiFeatures(
    models.Meal.find({ chef: user.id }),
    req.query
  ).pagination();

  //call api with feature
  const allMeals = await apiFeature.mongooseQuery;
  return res
    .status(200)
    .json({ success: true, message: "successfully", data: allMeals });
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

// get all meals
export const getAllMeals = async (req, res, next) => {
  //api features instance
  const apiFeature = new ApiFeatures(
    models.Meal.find(),
    req.query
  ).pagination();

  //call api with feature
  const allMeals = await apiFeature.mongooseQuery;
  return res
    .status(200)
    .json({ success: true, message: "successfully", data: allMeals });
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
