import { orderStatus } from '../../common/constants/order.constant.js'
import models from '../../DB/models/index.models.js'
import * as constants from '../../common/constants/index.constant.js'
import * as utils from "../../utils/index.utils.js"

// add a meal to the cart
export const addMealToCart = async (req, res, next) => {
    // get data
    let { chef, meal } = req.body

    // check meal existence 
    const mealExist = await models.Meal.findById(meal.mealId)
    if (!mealExist) return next(new utils.AppError("Meal is not found.", 404))

    // check if stock is not empty
    if (mealExist.stock <= 0) {
        return next(new utils.AppError("Meal is out of stock.", 400));
    }

    // check if meal quantity is valid
    if (mealExist.stock < meal.quantity) {
        return next(new utils.AppError(`Only ${mealExist.stock} ${mealExist.name} are available in stock.`, 400));
    }

    const chefExist = await models.User.findById(chef);
    if (!chefExist) {
        return next(new utils.AppError("Chef is not found.", 404));
    }
    
    // Not in chef mode
    if (chefExist.role !== constants.roles.CHEF) {
        if (!chefExist.kitchenStatus) {
            // Never was a chef
            return next(new utils.AppError("This user is not a chef and has no kitchen.", 400));
        } else {
            // Was a chef, but currently in user mode
            return next(new utils.AppError("The chef's kitchen is currently closed.", 400));
        }
    }

    // In chef mode, check if kitchen is open
    if (chefExist.kitchenStatus !== constants.kitchenStatus.OPEN) {
        return next(new utils.AppError("The chef's kitchen is currently closed. You cannot order meals at this time.", 400));
    }

    // check if this meal related to this chef 
    if (mealExist.chef.toString() !== chef.toString()) return next(new utils.AppError("Meal does not belong to this chef.", 400))

    // add price to meal obj
    meal.price = mealExist.price

    // search for a cartitem of this user with this chef
    let cartItemId = null
    const cartItemExist = await models.CartItem.findOne({ user: req.user._id, chef, isCheckedOut: false })
    if (!cartItemExist || cartItemExist.isCheckedOut) {
        // create new cartitem
        const newCartItem = await models.CartItem.create({ user: req.user._id, chef, meals: [meal] })
        if (!newCartItem) return next(new utils.AppError("Failed to create cart item.", 500));
        
        cartItemId = newCartItem._id
        // add cartitem to cart
        const cart = await models.Cart.findOneAndUpdate(
            { user: req.user._id, isDeleted: false },
            { $push: { cartItems: newCartItem._id } },
            { new: true }).populate({
                path: 'cartItems',
                select: 'meals totalPrice chef'
            }).select('-isDeleted -createdAt -updatedAt -__v');

        if (!cart) return next(new utils.AppError("Cart is not found.", 404))
        return res.status(200).json({
            success: true,
            message: "Meal added successfully to the cart.",
            cartItem_Id: cartItemId,
            mealsIds: newCartItem.meals.map(m => m.mealId)
        });
    }else{
        cartItemId = cartItemExist._id
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

    const updatedCart = await models.Cart.findOne({ user: req.user._id, isDeleted: false })
        .populate({
            path: 'cartItems',
            select: 'meals totalPrice chef',
            populate: [
                { path: 'meals.mealId', select: 'name images description' },
                { path: 'chef', select: 'firstName lastName image' }
            ]
        })
        .select('-isDeleted -createdAt -updatedAt -__v');

    if (!updatedCart)
        return next(new utils.AppError("Cart is not found.", 404));

    return res.status(201).json({
    success: true,
    message: "Meal added successfully to the cart.",
    cartItem_Id: cartItemId,
    mealsIds: cartItemExist.meals.map(m => m.mealId)
});
}

// delete a meal from the cart item
export const deleteMeal = async (req, res, next) => {
    // get data
    const { cartItemId, mealId } = req.params

    // check cartitem existence
    const cartItemExist = await models.CartItem.findById(cartItemId)
    if (!cartItemExist) return next(new utils.AppError("This cart item is not found.", 404))

    // check if the cart item is checked out
    if (cartItemExist.isCheckedOut) {
        return next(new utils.AppError("This cart item is already checked out.", 400));
    }

    // check meal exist in the cartitem
    const mealIndex = cartItemExist.meals.findIndex(ele => ele.mealId.toString() === mealId.toString())
    if (mealIndex === -1) return next(new utils.AppError("Meal is not found in the cart.", 404))

    // delete meal from the cart
    cartItemExist.meals.splice(mealIndex, 1)

    // check if cartitem is empty to delete it from the cart
    const cart = await models.Cart.findOne({ user: req.user._id })
    if (!cart) return next(new utils.AppError("Cart is not found.", 404))
    if (cartItemExist.meals.length == 0) {
        // delete cartitem from cart
        cart.cartItems.pull(cartItemExist._id);

        //delete cart item
        await cartItemExist.deleteOne()

        // save the cart
        await cart.save();
    }
    else {
        // update total price
        await models.CartItem.updateOne(
            { _id: cartItemId },
            {
                $set: {
                    meals: cartItemExist.meals,
                    totalPrice: cartItemExist.meals.reduce((sum, m) => sum + m.quantity * m.price, 0)
                }
            }, { new: true }
        );
        await cart.save()
    };

    const updatedCartItem = await models.CartItem.findById(cartItemId)
        .populate({ path: 'meals.mealId', select: 'name images description' })
        .populate({ path: 'chef', select: 'firstName lastName image' })
        .select('-isDeleted -createdAt -updatedAt -__v').lean()

    return res.status(200).json({ success: true, message: "Meal is deleted successfully, now your cart contains ", data: updatedCartItem })
}
// clear the cart (delete all cart items of the user)
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

// get all cart items of the user
export const getCartItems = async (req, res, next) => {
    const cart = await models.Cart.findOne({ user: req.user._id })
        .populate({
            path: 'cartItems',
            match: { isCheckedOut: false },
            select: 'meals totalPrice chef',
            populate: [
                {
                    path: 'chef',
                    select: 'firstName lastName image'
                },
                {
                    path: 'meals.mealId',
                    select: 'name images description stock'
                }
            ]
        });
    if (!cart) return next(new utils.AppError("Cart not found.", 404));

    if (cart.cartItems.length == 0) {
        return res.status(200).json({ success: true, message: "The cart is empty.", data: [] });
    }

    return res.status(200).json({ success: true, message: "Cart items retrieved successfully.", data: cart.cartItems });
}

// get a specific cart item by id
export const getCartItem = async (req, res, next) => {
    const { cartItemId } = req.params

    const cartItem = await models.CartItem.findById(cartItemId)
        .populate({ path: 'meals.mealId', select: 'name images description stock' })
        .populate({ path: 'chef', select: 'firstName lastName image' })
        .select('-isDeleted -createdAt -updatedAt -__v').lean();

    if (!cartItem) return next(new utils.AppError("Cart item not found.", 404));

    return res.status(200).json({ success: true, message: "Cart item retrieved successfully.", data: cartItem });
}

// update cart item (update quantity of meal or delete meal if quantity is 0)
export const updateCartItem = async (req, res, next) => {
    const { cartItemId, mealId } = req.params;
    const { quantity } = req.body;

    // check cartiem existence
    const cartItem = await models.CartItem.findById(cartItemId);
    if (!cartItem) return next(new utils.AppError("Cart item not found.", 404));

    // check if it checked out
    if (cartItem.isCheckedOut) {
        return next(new utils.AppError("This cart item is already checked out.", 400));
    }

    // check if meal exists in the cart item
    const mealIndex = cartItem.meals.findIndex(ele => ele.mealId.toString() === mealId.toString());
    if (mealIndex === -1) return next(new utils.AppError("Meal is not found in the cart.", 404));

    // get user cart
    const cart = await models.Cart.findOne({ user: req.user._id });
    if (!cart) return next(new utils.AppError("Cart is not found.", 404));

    // check quantity
    if (quantity > 0) {
        const mealExist = await models.Meal.findById(mealId);
        if (!mealExist) return next(new utils.AppError("Meal not found.", 404));

        if(mealExist.stock <= 0) return next(new utils.AppError("Meal is out of stock.", 400));
        
        if (mealExist.stock < quantity) {
            return next(new utils.AppError(`Not enough stock for ${mealExist.name}. Only ${mealExist.stock} available.`, 400));
        }

        cartItem.meals[mealIndex].quantity = quantity;

        cartItem.totalPrice = cartItem.meals.reduce((sum, m) => sum + m.quantity * m.price, 0);
        await cartItem.save();
        await cart.save();
    } else {
        cartItem.meals.splice(mealIndex, 1);

        if (cartItem.meals.length === 0) {
            cart.cartItems.pull(cartItem._id);
            await cartItem.deleteOne();
            await cart.save();
        } else {
            cartItem.totalPrice = cartItem.meals.reduce((sum, m) => sum + m.quantity * m.price, 0);
            await cartItem.save();
            await cart.save();
        }
    }

    const updatedCartItem = await models.CartItem.findById(cartItemId)
        .populate({ path: 'meals.mealId', select: 'name images description stock' })
        .populate({ path: 'chef', select: 'firstName lastName image' })
        .select('-isDeleted -createdAt -updatedAt -__v')
        .lean();

    return res.status(200).json({
        success: true,
        message: "Cart item updated successfully.",
        data: updatedCartItem,
    });
};

// checkout cart item
export const checkoutCartItem = async (req, res, next) => {
    const { cartItemId } = req.params;
    const { deliveryAddress, paymentMethod } = req.body;

    //  Check cart item existence
    const cartItem = await models.CartItem.findOne({
        _id: cartItemId,
        user: req.user._id,
        isCheckedOut: false
    }).populate("meals.mealId");

    if (!cartItem) return next(new utils.AppError("Cart item not found or already checked out", 404));

    const chefExist = await models.User.findById(cartItem.chef);
    if (!chefExist) {
        return next(new utils.AppError("Chef is not found.", 404));
    }
    
    // Not in chef mode
    if (chefExist.role !== constants.roles.CHEF) {
        if (!chefExist.kitchenStatus) {
            // Never was a chef
            return next(new utils.AppError("This user is not a chef and has no kitchen.", 400));
        } else {
            // Was a chef, but currently in user mode
            return next(new utils.AppError("The chef's kitchen is currently closed.", 400));
        }
    }

    // In chef mode, check if kitchen is open
    if (chefExist.kitchenStatus !== constants.kitchenStatus.OPEN) {
        return next(new utils.AppError("The chef's kitchen is currently closed. You cannot order meals at this time.", 400));
    }


    for (const meal of cartItem.meals) {
        const mealExist = await models.Meal.findById(meal.mealId);

        if (!mealExist) {
            return next(new utils.AppError("Meal not found.", 404));
        }

        if (mealExist.stock < meal.quantity) {
            return next(
                new utils.AppError(`Not enough stock for ${mealExist.name}.`, 400)
            );
        }
    }
    // Decrease meal stock
    for (const meal of cartItem.meals) {
        await models.Meal.updateOne(
            { _id: meal.mealId },
            { $inc: { stock: -meal.quantity } }
        );
    }

    // Calculate total
    const deliveryFee = 30;
    const serviceFee = 50;
    const total = cartItem.totalPrice + deliveryFee + serviceFee;

    // Create Order
    const order = await models.Order.create({
        user: req.user._id,
        cartItem: cartItemId,
        chef: cartItem.chef,
        deliveryAddress,
        paymentMethod,
        subtotal: cartItem.totalPrice,
        deliveryFee,
        serviceFee,
        total,
        status: orderStatus.ORDERED
    });

    // Mark as checked out
    cartItem.isCheckedOut = true;
    await cartItem.save();

    // Remove cartItem from user’s cart
    await models.Cart.updateOne(
        { user: req.user._id },
        { $pull: { cartItems: cartItem._id } }
    );

    res.status(200).json({
        success: true,
        message: "Cart item checked out successfully",
        data: {
            order: order._id
        }
    });
};
