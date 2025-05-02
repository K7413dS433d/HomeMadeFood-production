import { Router } from "express";
import * as mealSchema from "./meal.validation.js";
import * as mealService from "./meal.service.js";
import { extensions, roles } from "../../common/constants/index.constant.js";
import { asyncHandler } from "../../utils/index.utils.js";
import {
  isAuthenticated,
  isAuthorized,
  multiUploader,
  validateSchema,
} from "../../middleware/index.middlewares.js";

const mealRouter = Router();

mealRouter.post(
  "/add-meal",
  isAuthenticated(process.env.TOKEN_CHEF_VALUE),
  isAuthorized(roles.CHEF),
  multiUploader({ fieldName: "images", allowedExtensions: extensions.IMAGES }),
  validateSchema(mealSchema.addMeal),
  asyncHandler(mealService.addMeal)
);

mealRouter.patch(
  "/update-meal/:id",
  isAuthenticated(process.env.TOKEN_CHEF_VALUE),
  isAuthorized(roles.CHEF),
  multiUploader({ fieldName: "images", allowedExtensions: extensions.IMAGES }),
  validateSchema(mealSchema.updateMeal),
  asyncHandler(mealService.updateMeal)
);

mealRouter.delete(
  "/delete-meal/:id",
  isAuthenticated(process.env.TOKEN_CHEF_VALUE),
  isAuthorized(roles.CHEF),
  validateSchema(mealSchema.deleteMeal),
  asyncHandler(mealService.deleteMeal)
);

mealRouter.get(
  "/get-chef-meals",
  isAuthenticated(process.env.TOKEN_CHEF_VALUE),
  isAuthorized(roles.CHEF),
  validateSchema(mealSchema.getMeals),
  asyncHandler(mealService.getAllChefMeals)
);

mealRouter.post(
  "/favorite-meal/:id",
  isAuthenticated(process.env.TOKEN_ALL_VALUE),
  isAuthorized(roles.CHEF, roles.USER),
  validateSchema(mealSchema.addMealToFav),
  asyncHandler(mealService.addMealToFav)
);

mealRouter.delete(
  "/remove-favorite-meal/:id",
  isAuthenticated(process.env.TOKEN_ALL_VALUE),
  isAuthorized(roles.CHEF, roles.USER),
  validateSchema(mealSchema.removeMealFromFav),
  asyncHandler(mealService.removeMealFromFav)
);

mealRouter.get(
  "/get-all-meals",
  isAuthenticated(process.env.TOKEN_ALL_VALUE),
  isAuthorized(roles.CHEF, roles.USER),
  validateSchema(mealSchema.getMeals),
  asyncHandler(mealService.getAllMeals)
);

export default mealRouter;
