import models from '../../DB/models/index.models.js'
import * as utils from '../../utils/index.utils.js'
import * as constants from '../../common/constants/index.constant.js'

// user can create order
export const createOrder = async (req, res, next) => {
    // get data.
    const { cartItemId } = req.params
    const { locationId, address, longitude, latitude, paymentMethod } = req.body

    // check if item exist in cartitems.
    const cartItem = await models.CartItem.findById(cartItemId)
    if (!cartItem) return next(new utils.AppError("Cart item is not found.", 404))

    if (cartItem.isCheckedOut) return next(new utils.AppError("Order already created.", 400))

    const order = await models.Order.create({
        user: req.user._id,
        chef: cartItem.chef,
        cartItem: cartItemId,
        orderPrice: cartItem.totalPrice,
        paymentMethod,
        deliveryAddress:{
            locationId: locationId || undefined,
            address: address || undefined,
            longitude: longitude || undefined,
            latitude: latitude || undefined
        }
    })
    if (!order) return next(new utils.AppError("Failed to create the order", 500))

    // update the cartitem 
    await cartItem.updateOne({ isCheckedOut: true })

    return res.status(201).json({ success: true, message: "Order created successfully.", data: order })
}
// user can get all his orders
export const getUserOrders = async (req, res, next) => {
    const orders = await models.Order.find({ user: req.user._id, status: { $ne: constants.orderStatus.CANCELED } }).lean()
    if (orders.length == 0) return next(new utils.AppError("User has no orders.", 404))
    return res.status(200).json({ success: true, message: "All user orders are ", data: orders })
}
// user and admin can get any user order
export const getUserOrder = async (req, res, next) => {
    const { orderId } = req.params

    const order = await models.Order.findById(orderId)
    if (!order) return next(new utils.AppError("Order not found.", 404));

    // check if role is user
    if (req.user.role == constants.roles.USER) {
        if (order.user.toString() != req.user._id.toString()) return next(new utils.AppError("Unauthorized", 403));
        return res.status(200).json({ success: true, message: "Order details", data: order });
    }

    // check if role is admin
    if (req.user.role == constants.roles.ADMIN) {
        return res.status(200).json({ message: "Order details", data: order });
    }
    return next(new utils.AppError("Unauthorized", 403))
}
// user can cancel any order related to him
export const cancelOrder = async (req, res, next) => {
    const { orderId } = req.params

    const orderExist = await models.Order.findById(orderId)
    if (!orderExist) return next(new utils.AppError("Order is not exist.", 404))

    if (orderExist.status == constants.orderStatus.CANCELED) return next(new utils.AppError("Order is already canceled.", 404))

    await orderExist.updateOne({ status: constants.orderStatus.CANCELED })

    return res.status(200).json({ success: true, message: "Order canceled successfully." })
}
// only the admin can get all orders
export const getAllOrders = async (req, res, next) => {
    const { status, paymentMethod, user } = req.query;

    let filter = {}
    if (status) filter.status = status
    if (paymentMethod) filter.paymentMethod = paymentMethod
    if (user) filter.user = user

    const orders = await models.Order.find(filter)
    if (orders.length == 0) return next(new utils.AppError("There are no existing orders.", 404))

    return res.status(200).json({ success: true, message: "All orders are ", data: orders })
}
// only the admin, chef, delivery can update the order status
export const updateOrderStatus = async (req, res, next) => {
    const { orderId } = req.params
    const { status } = req.body

    const orderExist = await models.Order.findById(orderId)
    if (!orderExist) return next(new utils.AppError("Order is not exist.", 404))

    orderExist.status = status
    await orderExist.save()

    return res.status(200).json({ success: true, message: "Order status updated successfully", data: orderExist })
}