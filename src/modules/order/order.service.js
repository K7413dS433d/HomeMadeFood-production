import models from "../../DB/models/index.models.js";
import * as utils from "../../utils/index.utils.js";
import * as constants from "../../common/constants/index.constant.js";
import mongoose from "mongoose";
import moment from "moment";

// user can get all his orders
export const getUserOrders = async (req, res, next) => {
  const orders = await models.Order.find({
    user: req.user._id,
    status: { $ne: constants.orderStatus.CANCELED },
  })
    .select("status chef cartItem createdAt updatedAt")
    .populate({
      path: "chef",
      select: "firstName lastName image",
    })
    .populate({
      path: "cartItem",
      select: "meals",
      populate: {
        path: "meals.mealId",
        select: "name images",
      },
    });

  if (orders.length === 0)
    return next(new utils.AppError("User has no orders.", 404));

  return res.status(200).json({
    success: true,
    message: "All user orders retrieved successfully.",
    data: orders,
  });
};

// get full order
export const getFullOrder = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await models.Order.findById(orderId)
    .select("total deliveryFee serviceFee cartItem chef user")
    .populate({
      path: "cartItem",
      select: "meals",
      populate: {
        path: "meals.mealId",
        select: "name images description",
      },
    })
    .lean();

  if (!order) return next(new utils.AppError("Order not found.", 404));

  const isUser = req.user.role === constants.roles.USER;
  const isChef = req.user.role === constants.roles.CHEF;

  if (isUser && order.user?._id.toString() !== req.user._id.toString()) {
    return next(new utils.AppError("Unauthorized", 403));
  }

  if (isChef && order.chef?._id.toString() !== req.user._id.toString()) {
    return next(new utils.AppError("Unauthorized", 403));
  }

  if (order.status == constants.orderStatus.CANCELED)
    return next(new utils.AppError("Order is canceled.", 404));

  return res.status(200).json({
    success: true,
    message: "Full Order",
    data: order,
  });
};

// get order details
export const getOrderDetails = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await models.Order.findById(orderId)
    .populate({ path: "chef", select: "firstName lastName" })
    .populate({ path: "user", select: "firstName lastName phone" })
    .populate({
      path: "cartItem",
      select: "meals",
      populate: { path: "meals.mealId", select: "name images description" },
    });

  if (!order) return next(new utils.AppError("Order not found.", 404));

  const isUser = req.user.role === constants.roles.USER;
  const isChef = req.user.role === constants.roles.CHEF;

  if (isUser && order.user?._id.toString() !== req.user._id.toString()) {
    return next(new utils.AppError("Unauthorized", 403));
  }

  if (isChef && order.chef?._id.toString() !== req.user._id.toString()) {
    return next(new utils.AppError("Unauthorized", 403));
  }

  return res.status(200).json({
    success: true,
    message: "Order details",
    data: order,
  });
};

// user or chef can cancel any order related to him
export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await models.Order.findById(orderId)
    .populate({
      path: "cartItem",
      select: "meals",
    })
    .populate({ path: "user", select: "_id" })
    .populate({ path: "chef", select: "_id" });

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
    return next(
      new utils.AppError("Unauthorized: You can't cancel this order.", 403)
    );
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
    order: order._id,
  });
};

// get chef orders
export const getChefOrders = async (req, res, next) => {
  const chefId = req.user.id;
  const filter = req.query.filter || constants.salesOverview.ALL_TIME;
  const name = req.query.name;
  const status = req.query.status;
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;

  let matchStage = {
    chef: new mongoose.Types.ObjectId(chefId),
  };

  // Filter by date
  if (filter !== constants.salesOverview.ALL_TIME) {
    const now = moment().endOf("day");
    let start;

    switch (filter) {
      case constants.salesOverview.TODAY:
        start = moment().startOf("day");
        break;
      case constants.salesOverview.WEEKLY:
        start = moment().startOf("isoWeek");
        break;
      case constants.salesOverview.MONTHLY:
        start = moment().startOf("month");
        break;
      case constants.salesOverview.YEARLY:
        start = moment().startOf("year");
        break;
    }

    matchStage.createdAt = {
      $gte: start.toDate(),
      $lte: now.toDate(),
    };
  }

  // Filter by status if exists
  if (status) {
    matchStage.status = status;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ];

  if (name) {
    pipeline.push({
      $match: {
        "user.firstName": {
          $regex: name,
          $options: "i",
        },
      },
    });
  }

  pipeline.push(
    {
      $addFields: {
        lastOrderHour: {
          $let: {
            vars: {
              hour: { $hour: { date: "$createdAt", timezone: "UTC" } },
            },
            in: {
              $cond: [
                { $eq: ["$$hour", 0] },
                12,
                {
                  $cond: [
                    { $gt: ["$$hour", 12] },
                    { $subtract: ["$$hour", 12] },
                    "$$hour",
                  ],
                },
              ],
            },
          },
        },
        lastOrderMinute: {
          $toString: {
            $minute: { date: "$createdAt", timezone: "UTC" },
          },
        },
        amPm: {
          $cond: [
            {
              $lt: [{ $hour: { date: "$createdAt", timezone: "UTC" } }, 12],
            },
            "AM",
            "PM",
          ],
        },
      },
    },
    {
      $addFields: {
        orderTime: {
          $concat: [
            { $toString: "$lastOrderHour" },
            ":",
            {
              $cond: [
                { $lt: [{ $strLenCP: "$lastOrderMinute" }, 2] },
                { $concat: ["0", "$lastOrderMinute"] },
                "$lastOrderMinute",
              ],
            },
            " ",
            "$amPm",
          ],
        },
      },
    },
    {
      $project: {
        _id: "$_id",
        name: "$user.firstName",
        status: "$status",
        orderTime: 1,
      },
    },
    { $skip: skip },
    { $limit: limit }
  );

  const result = await models.Order.aggregate(pipeline);

  if (!result || result.length === 0) {
    return next(new utils.AppError(`No orders found for ${filter}`, 404));
  }

  return res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
};

// chef can accept the order
export const acceptOrder = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await models.Order.findById(orderId).populate("chef", "_id");

  if (!order) {
    return next(new utils.AppError("Order not found.", 404));
  }

  if (
    req.user.role !== constants.roles.CHEF ||
    order.chef?._id.toString() !== req.user._id.toString()
  ) {
    return next(
      new utils.AppError("Unauthorized: This is not your order", 403)
    );
  }

  if (order.status !== constants.orderStatus.ORDERED) {
    return next(
      new utils.AppError("Order cannot be accepted in its current state.", 400)
    );
  }

  order.status = constants.orderStatus.PREPARING;
  order.acceptedAt = new Date();
  await order.save();

  return res.status(200).json({
    success: true,
    message: "Order accepted successfully",
    order: order._id,
  });
};

// chef can update the order status
export const updateOrderStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await models.Order.findById(orderId).populate({
    path: "cartItem",
    select: "meals",
  });

  if (!order) {
    return next(new utils.AppError("Order does not exist.", 404));
  }

  if (
    req.user.role !== constants.roles.CHEF ||
    order.chef?.toString() !== req.user._id.toString()
  ) {
    return next(
      new utils.AppError("Unauthorized: You can't update this order.", 403)
    );
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
        $inc: { stock: meal.quantity },
      });
    }
  }

  order.status = status;
  if (status === constants.orderStatus.DELIVERED) {
    order.deliveredAt = new Date();
  } else if (status == constants.orderStatus.CANCELED) {
    order.acceptedAt = undefined;
  }
  await order.save();

  return res.status(200).json({
    success: true,
    message: `Order status updated to "${status}" successfully.`,
    order: order._id,
  });
};
