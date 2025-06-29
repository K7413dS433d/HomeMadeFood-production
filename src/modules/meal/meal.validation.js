import joi from "joi";
import * as constants from "../../common/constants/index.constant.js";
import {
  fileValidatorType,
  objectIdSchema,
  objectIdValidator,
} from "../../common/validators/index.validators.js";

export const idOnlySchema = joi
  .object({
    id: objectIdSchema,
  })
  .required();

export const addMeal = joi
  .object({
    name: joi.string().required(),
    description: joi.string().required(),
    category: joi
      .string()
      .valid(...Object.values(constants.mealCategory))
      .required(),
    price: joi.number().precision(4),
    file: joi.array().items(fileValidatorType("images").required()).required(),
    stock: joi.number().integer().required().min(0).messages({
      "number.base": "Stock must be a number",
      "number.min": "Stock must be greater than or equal to 0",
    }),
    hiddenStatus: joi.boolean(),
  })
  .required();

//delete meal
export const deleteMeal = idOnlySchema;

//add meal to fav
export const addMealToFav = idOnlySchema;

//add meal to fav
export const removeMealFromFav = idOnlySchema;

//get meal
export const getMealDetails = idOnlySchema;

//get meals
export const getMeals = joi
  .object({
    page: joi.number(),
    limit: joi.number(),
  })
  .required();

//get all meals
export const getAllMeals = joi
  .object({
    page: joi.number(),
    limit: joi.number(),
    search: joi.string(),
    category: joi.string().valid(...Object.values(constants.mealCategory)),
    chef: joi.custom(objectIdValidator),
  })
  .required();

//update meal
export const updateMeal = joi
  .object({
    id: objectIdSchema.required(),
    name: joi.string(),
    description: joi.string(),
    category: joi.string().valid(...Object.values(constants.mealCategory)),
    price: joi.number().precision(4),
    file: joi.array().items(fileValidatorType("images").required()),
    stock: joi.number().integer().min(0).messages({
      "number.base": "Stock must be a number",
      "number.min": "Stock must be greater than or equal to 0",
    }),
    hiddenStatus: joi.boolean(),
  })
  .or(
    "name",
    "description",
    "category",
    "price",
    "file",
    "hiddenStatus",
    "stock"
  )
  .required();
