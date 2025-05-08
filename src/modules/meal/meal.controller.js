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
} from "../../middleware/index.middlewares.js";

const mealRouter = Router();

//add meal
mealRouter.post(
  "/",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF),
  multiUploader({ fieldName: "images", allowedExtensions: extensions.IMAGES }),
  validateSchema(mealSchema.addMeal),
  asyncHandler(mealService.addMeal)
);

// update meal
mealRouter.patch(
  "/:id",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF),
  multiUploader({ fieldName: "images", allowedExtensions: extensions.IMAGES }),
  validateSchema(mealSchema.updateMeal),
  asyncHandler(mealService.updateMeal)
);

//delete meal
mealRouter.delete(
  "/:id",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF),
  validateSchema(mealSchema.deleteMeal),
  asyncHandler(mealService.deleteMeal)
);

// get all chef meals
mealRouter.get(
  "/chef",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF),
  validateSchema(mealSchema.getMeals),
  asyncHandler(mealService.getAllChefMeals)
);

// add meal to fav
mealRouter.post(
  "/favorites/:id",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF, roles.USER),
  validateSchema(mealSchema.addMealToFav),
  asyncHandler(mealService.addMealToFav)
);

mealRouter.delete(
  "/favorites/:id",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF, roles.USER),
  validateSchema(mealSchema.removeMealFromFav),
  asyncHandler(mealService.removeMealFromFav)
);

mealRouter.get(
  "/",
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.CHEF, roles.USER),
  validateSchema(mealSchema.getMeals),
  asyncHandler(mealService.getAllMeals)
);

mealRouter.post(
  "/similar",
  isAuthenticated(process.env.TOKEN_USER_VALUE),
  isAuthorized(roles.CHEF, roles.USER),
  singleUploader({ fieldName: "file", allowedExtensions: extensions.IMAGES }),
  validateSchema(mealSchema.getMeals),
  asyncHandler(mealService.getSimilarMeals)
);
export default mealRouter;
