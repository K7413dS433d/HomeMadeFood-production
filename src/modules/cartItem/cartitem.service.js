import models from '../../DB/models/index.models.js'
import * as utils from "../../utils/index.utils.js"

export const addMealToCart = async (req, res, next) => {
    // get data
    let { chef, meal } = req.body

    // check meal existence 
    const mealExist = await models.Meal.findById(meal.mealId)
    if (!mealExist) return next(new utils.AppError("Meal is not found.", 404))

    // check chef existence
    // const chefExist = await models.Chef.findById(chef)
    // if(!chefExist) return next(new utils.AppError("Chef is not found.", 404))

    // check if this meal related to this chef 
    if (mealExist.chef.toString() !== chef.toString()) return next(new utils.AppError("Meal does not belong to this chef.", 400))

    // add price to meal obj
    meal.price = mealExist.price

    // search for a cartitem of this user with this chef
    const cartItemExist = await models.CartItem.findOne({ user: req.user._id, chef })
    if (!cartItemExist) {
        // create new cartitem
        const newCartItem = await models.CartItem.create({ user: req.user._id, chef, meals: [meal] })
        if (!newCartItem) return next(new utils.AppError("Failed to create cart item.", 500));

        // add cartitem to cart
        const cart = await models.Cart.findOneAndUpdate(
            { user: req.user._id, isDeleted: false },
            { $push: { cartItems: newCartItem._id } },
            { new: true }).populate({
                path: 'cartItems',
                select: 'meals totalPrice'
            }).select('-isDeleted -createdAt -updatedAt -__v');

        if (!cart) return next(new utils.AppError("Cart is not found.", 404))
        return res.status(200).json({ success: true, message: "Meal added successfully to the cart.", data: cart })
    }

    // check meal existence in the cartitem
    const mealIndex = cartItemExist.meals.findIndex(ele => ele.mealId.toString() === meal.mealId.toString())
    if (mealIndex === -1) {
        cartItemExist.meals.push(meal)
    }
    else {
        // update the quantity of the meal
        cartItemExist.meals[mealIndex].quantity = meal.quantity
    }
    // update total price
    cartItemExist.totalPrice = cartItemExist.meals.reduce((sum, m) => sum + (m.quantity * m.price), 0);
    await cartItemExist.save()

    return res.status(201).json({ success: true, message: "Meal added successfully to the cart.", data: cartItemExist })
}

export const deleteMeal = async (req, res, next) => {
    // get data
    const { cartItemId, mealId } = req.params

    // check cartitem existence
    const cartItemExist = await models.CartItem.findById(cartItemId)
    if (!cartItemExist) return next(new utils.AppError("This cart item is not found.", 404))

    // check meal exist in the cartitem
    const mealIndex = cartItemExist.meals.findIndex(ele => ele.mealId.toString() === mealId.toString())
    if (mealIndex === -1) return next(new utils.AppError("Meal is not found in the cart.", 404))

    // delete meal from the cart
    cartItemExist.meals.splice(mealIndex, 1)

    // update the total price
    cartItemExist.totalPrice = cartItemExist.meals.reduce((sum, m) => sum + (m.quantity * m.price), 0);

    // check if cartitem is empty to delete it from the cart
    const cart = await models.Cart.findOne({ user: req.user._id }).populate({ path: 'cartItems', select: 'meals totalPrice chef' }).select('-isDeleted -createdAt -updatedAt -__v')
    if (!cart) return next(new utils.AppError("Cart is not found.", 404))
    if (cartItemExist.meals.length == 0) {
        // delete cartitem from cart
        cart.cartItems.pull(cartItemExist._id);

        //delete cart item
        await cartItemExist.deleteOne()
    }
    await Promise.all([cartItemExist.save(), cart.save()]);

    const updatedCart = await models.Cart.findById(cart._id)
        .populate({ path: 'cartItems', select: 'meals totalPrice chef' })
        .select('-isDeleted -createdAt -updatedAt -__v');
    return res.status(200).json({ success: true, message: "Meal is deleted successfully, now your cart contains ", data: updatedCart.cartItems.length ? updatedCart : [] })
}

export const clearCart = async (req, res, next) => {
    const cart = await models.Cart.findOne({ user: req.user._id })
    if (!cart) return next(new utils.AppError("Cart not found.", 404));

    if (cart.cartItems.length == 0) return res.status(200).json({ success: true, message: "The cart is empty.", data: [] })

    // delete all the cartitems from the cartitem table
    await models.CartItem.deleteMany({ _id: { $in: cart.cartItems } });

    // delete cartitems from the cart
    cart.cartItems = []
    await cart.save()

    return res.status(200).json({ success: true, message: "Cart cleared successfully.", data: [] })
}

export const getCartItems = async (req, res, next) => {
    const cart = await models.Cart.findOne({ user: req.user._id })
        .populate({
            path: 'cartItems',
            select: 'meals totalPrice chef'
        });
    if (!cart) return next(new utils.AppError("Cart not found.", 404));

    if (cart.cartItems.length == 0) {
        return res.status(200).json({ success: true, message: "The cart is empty.", data: [] });
    }

    return res.status(200).json({ success: true, message: "Cart items retrieved successfully.", data: cart.cartItems });
}

export const updateCartItem = async (req, res, next) => {
    const { cartItemId, mealId } = req.params
    const { quantity } = req.body

    // check cartitem existence
    const cartItemExist = await models.CartItem.findById(cartItemId)
    if (!cartItemExist) return next(new utils.AppError("This cart item is not found.", 404))

    // check meal existence in cart item.
    const mealIndex = cartItemExist.meals.findIndex(ele => ele.mealId.toString() === mealId.toString())
    if (mealIndex === -1) return next(new utils.AppError("Meal is not found in the cart.", 404))

    // get user cart
    const cart = await models.Cart.findOne({ user: req.user._id })
    if (!cart) return next(new utils.AppError("Cart is not found.", 404))

    // quantity (quantity == 0 ? delete meal : update quantity)
    if (quantity === 0) {
        cartItemExist.meals.splice(mealIndex, 1)
        if (cartItemExist.meals.length == 0) {
            // delete cartitem from cart
            cart.cartItems.pull(cartItemExist._id);

            //delete cart item
            await cartItemExist.deleteOne()
        }
    }
    else cartItemExist.meals[mealIndex].quantity = quantity

    // update total price
    cartItemExist.totalPrice = cartItemExist.meals.reduce((sum, m) => sum + (m.quantity * m.price), 0);
    await Promise.all([cartItemExist.save(), cart.save()]);

    const updatedCart = await models.Cart.findById(cart._id)
        .populate({ path: 'cartItems', select: 'meals totalPrice chef' })
        .select('-isDeleted -createdAt -updatedAt -__v');

    return res.status(200).json({ success: true, message: "Cart updated successfully.", data: updatedCart.cartItems.length ? updatedCart : [] })
}
