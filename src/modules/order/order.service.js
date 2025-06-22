import models from '../../DB/models/index.models.js'
import * as utils from '../../utils/index.utils.js'
import * as constants from '../../common/constants/index.constant.js'


// user can get all his orders
export const getUserOrders = async (req, res, next) => {
    const orders = await models.Order.find({
        user: req.user._id,
        status: { $ne: constants.orderStatus.CANCELED }
    })
        .select('status chef cartItem')
        .populate({
            path: 'chef',
            select: 'firstName lastName image'
        })
        .populate({
            path: 'cartItem',
            select: 'meals',
            populate: {
                path: 'meals.mealId',
                select: 'name images'
            }
        });

    if (orders.length === 0)
        return next(new utils.AppError("User has no orders.", 404));

    return res.status(200).json({
        success: true,
        message: "All user orders retrieved successfully.",
        data: orders
    });
};

// get full order
export const getFullOrder = async (req, res, next) => {
    const { orderId } = req.params

    const order = await models.Order.findById(orderId)
        .select('total deliveryFee serviceFee cartItem chef')
        .populate({
            path: 'cartItem',
            select: 'meals',
            populate: {
                path: 'meals.mealId',
                select: 'name images description'
            }
        }).lean();

    if (!order) return next(new utils.AppError("Order not found.", 404))

    const isUser = req.user.role === constants.roles.USER
    const isChef = req.user.role === constants.roles.CHEF

    if (isUser && order.user?._id.toString() !== req.user._id.toString()) {
        return next(new utils.AppError('Unauthorized', 403))
    }

    if (isChef && order.chef?._id.toString() !== req.user._id.toString()) {
        return next(new utils.AppError('Unauthorized', 403))
    }

    if (order.status == constants.orderStatus.CANCELED) return next(new utils.AppError("Order is canceled.", 404))

    return res.status(200).json({
        success: true,
        message: 'Full Order',
        data: order
    })
}

// get order details
export const getOrderDetails = async (req, res, next) => {
    const { orderId } = req.params

    const order = await models.Order.findById(orderId)
        .populate({ path: 'chef', select: 'firstName lastName' })
        .populate({ path: 'user', select: 'firstName lastName phone' })
        .populate({
            path: 'cartItem',
            select: 'meals',
            populate: { path: 'meals.mealId', select: 'name images description' }
        })

    if (!order) return next(new utils.AppError('Order not found.', 404))

    const isUser = req.user.role === constants.roles.USER
    const isChef = req.user.role === constants.roles.CHEF

    if (isUser && order.user?._id.toString() !== req.user._id.toString()) {
        return next(new utils.AppError('Unauthorized', 403))
    }

    if (isChef && order.chef?._id.toString() !== req.user._id.toString()) {
        return next(new utils.AppError('Unauthorized', 403))
    }

    return res.status(200).json({
        success: true,
        message: 'Order details',
        data: order
    })
}

// user or chef can cancel any order related to him
export const cancelOrder = async (req, res, next) => {
    const { orderId } = req.params;

    const order = await models.Order.findById(orderId)
        .populate({
            path: 'cartItem',
            select: 'meals',
        })
        .populate({ path: 'user', select: '_id' })
        .populate({ path: 'chef', select: '_id' });

    if (!order) {
        return next(new utils.AppError("Order does not exist.", 404));
    }

    if (order.status === constants.orderStatus.CANCELED) {
        return next(new utils.AppError("Order is already canceled.", 400));
    }
    if (order.status === constants.orderStatus.DELIVERED) {
        return next(new utils.AppError("Order is already delivered.", 400));
    }

    const isUser = req.user.role === constants.roles.USER;
    const isChef = req.user.role === constants.roles.CHEF;

    const isOwner =
        (isUser && order.user?._id.toString() === req.user._id.toString()) ||
        (isChef && order.chef?._id.toString() === req.user._id.toString());

    if (!isOwner) {
        return next(new utils.AppError("Unauthorized: You can't cancel this order.", 403));
    }

    for (const meal of order.cartItem.meals) {
        await models.Meal.findByIdAndUpdate(meal.mealId, {
            $inc: { stock: meal.quantity },
        });
    }

    if (isChef) {
        order.acceptedAt = undefined;
    }

    order.status = constants.orderStatus.CANCELED;
    await order.save();

    return res.status(200).json({
        success: true,
        message: "Order canceled and meal stock updated successfully.",
        order: order._id
    });

};

// get chef orders
export const getChefOrders = async (req, res, next) => {
    const { status, range } = req.query
    const filter = { chef: req.user._id }

    if (status) {
        filter.status = status
    }

    if (range) {
        const now = new Date()
        let startDate

        switch (range.toLowerCase()) {
            case 'today':
                startDate = new Date()
                startDate.setHours(0, 0, 0, 0)
                break

            case 'weekly':
                startDate = new Date()
                startDate.setDate(startDate.getDate() - 7)
                break

            case 'monthly':
                startDate = new Date()
                startDate.setMonth(startDate.getMonth() - 1)
                break

            case 'yearly':
                startDate = new Date()
                startDate.setFullYear(startDate.getFullYear() - 1)
                break

            case 'alltime':
                startDate = null
                break

            default:
                return res.status(400).json({
                    status: 'fail',
                    message: 'Invalid range value. Use: today, weekly, monthly, yearly, alltime'
                })
        }

        if (startDate) {
            filter.createdAt = { $gte: startDate }
        }
    }

    const orders = await models.Order.find(filter)
        .sort({ createdAt: -1 })
        .select('_id user createdAt status')
        .populate({
            path: 'user',
            select: 'firstName lastName'
        })

    const allOrders = orders.map(order => ({
        id: order._id,
        userName: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown',
        date: order.createdAt,
        status: order.status
    }))

    res.status(200).json({
        status: 'success',
        results: allOrders.length,
        data: allOrders
    })
}
// chef can accept the orde
export const acceptOrder = async (req, res, next) => {
    const { orderId } = req.params;

    const order = await models.Order.findById(orderId).populate('chef', '_id');

    if (!order) {
        return next(new utils.AppError("Order not found.", 404));
    }

    if (req.user.role !== constants.roles.CHEF || order.chef?._id.toString() !== req.user._id.toString()) {
        return next(new utils.AppError("Unauthorized: This is not your order", 403));
    }


    if (order.status !== constants.orderStatus.ORDERED) {
        return next(new utils.AppError("Order cannot be accepted in its current state.", 400));
    }

    order.status = constants.orderStatus.PREPARING;
    order.acceptedAt = new Date();
    await order.save();

    return res.status(200).json({
        success: true,
        message: "Order accepted successfully",
        order: order._id
    });

};

// chef can update the order status
export const updateOrderStatus = async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;


    const order = await models.Order.findById(orderId).populate({
        path: 'cartItem',
        select: 'meals',
    });

    if (!order) { return next(new utils.AppError("Order does not exist.", 404)); }

    if (req.user.role !== constants.roles.CHEF || order.chef?.toString() !== req.user._id.toString()) {
        return next(new utils.AppError("Unauthorized: You can't update this order.", 403));
    }

    if (order.status === constants.orderStatus.CANCELED) {
        return next(new utils.AppError("Cannot update a canceled order.", 400));
    }
    if (order.status === constants.orderStatus.DELIVERED) {
        return next(new utils.AppError("Cannot update a delivered order.", 400));
    }

    if (status === constants.orderStatus.CANCELED) {
        for (const meal of order.cartItem.meals) {
            await models.Meal.findByIdAndUpdate(meal.mealId, {
                $inc: { stock: meal.quantity }
            });
        }
    }

    order.status = status;
    if (status === constants.orderStatus.DELIVERED) {
        order.deliveredAt = new Date();
    }
    else if (status == constants.orderStatus.CANCELED) {
        order.acceptedAt = undefined;
    }
    await order.save();

    return res.status(200).json({
        success: true,
        message: `Order status updated to "${status}" successfully.`,
        order: order._id
    });

};
