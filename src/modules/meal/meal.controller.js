import { Router } from "express";
import * as mealSchema from "./meal.validation.js";
import * as mealService from "./meal.service.js";
import { extensions, roles } from "../../common/constants/index.constant.js";
import { asyncHandler } from "../../utils/index.utils.js";
import {
  isAuthenticated,
  isAuthorized,
  multiUploader,
  singleUploader,
  validateSchema,
  isVerified,
} from "../../middleware/index.middlewares.js";

const mealRouter = Router();

//add meal
mealRouter.post(
  "/",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF),
  isVerified,
  multiUploader({ fieldName: "images", allowedExtensions: extensions.IMAGES }),
  validateSchema(mealSchema.addMeal),
  asyncHandler(mealService.addMeal)
);

/// update meal
mealRouter.patch(
  "/:id",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF),
  isVerified,
  multiUploader({ fieldName: "images", allowedExtensions: extensions.IMAGES }),
  validateSchema(mealSchema.updateMeal),
  asyncHandler(mealService.updateMeal)
);

//delete meal
mealRouter.delete(
  "/:id",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF),
  isVerified,
  validateSchema(mealSchema.deleteMeal),
  asyncHandler(mealService.deleteMeal)
);

//get recommended meals
mealRouter.get("/get-recommended-meals",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.USER),
  isVerified,
  asyncHandler(mealService.getRecommendedMeals)
);

// get all chef meals
mealRouter.get(
  "/chef",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF),
  isVerified,
  validateSchema(mealSchema.getMeals),
  asyncHandler(mealService.getAllChefMeals)
);

// add meal to fav
mealRouter.post(
  "/favorites/:id",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF, roles.USER),
  isVerified,
  validateSchema(mealSchema.addMealToFav),
  asyncHandler(mealService.addMealToFav)
);

// get favorite meals
mealRouter.get(
  "/favorites",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF, roles.USER),
  isVerified,
  asyncHandler(mealService.getFavoriteMeals)
);

// remove meal from fav
mealRouter.delete(
  "/favorites/:id",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF, roles.USER),
  isVerified,
  validateSchema(mealSchema.removeMealFromFav),
  asyncHandler(mealService.removeMealFromFav)
);

// get all meals
mealRouter.get(
  "/",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF, roles.USER),
  isVerified,
  validateSchema(mealSchema.getAllMeals),
  asyncHandler(mealService.getAllMeals)
);

//get meal
mealRouter.get(
  "/:id",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF, roles.USER),
  isVerified,
  validateSchema(mealSchema.getMealDetails),
  asyncHandler(mealService.getMealDetails)
);

mealRouter.post(
  "/similar",
  isAuthenticated(process.env.BEARER_KEY),
  isVerified,
  isAuthorized(roles.CHEF, roles.USER),
  singleUploader({ fieldName: "file", allowedExtensions: extensions.IMAGES }),
  asyncHandler(mealService.getSimilarMeals)
);
export default mealRouter;
