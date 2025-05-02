import joi from "joi";

// add cart items
export const addMealToCart = joi
  .object({
    // body
    chef: joi.string().required(),
    meal: joi
      .object({
        mealId: joi.string().required(),
        quantity: joi.number().min(1).required(),
      })
      .required(),
  })
  .required();

// delete cart item
export const deleteMeal = joi
  .object({
    // params
    cartItemId: joi.string().required(),
    mealId: joi.string().required(),
  })
  .required();

// update cart item
export const updateCartItem = joi
  .object({
    // params
    cartItemId: joi.string().required(),
    mealId: joi.string().required(),

    // body
    quantity: joi.number().required().min(0),
  })
  .required();
