import models from "./../../DB/models/index.models.js";
import { AppError } from "../../utils/index.utils.js";

//get all user addresses
export const getAllAddresses = async (req, res, next) => {
  const { user } = req;

  const allAddresses = await models.Location.find({ userId: user.id }).select(
    "-userId"
  );

  return res
    .status(200)
    .json({ success: true, message: "successfully", data: allAddresses });
};

//add new location
export const addAddress = async (req, res, next) => {
  const { addressName, default: defLoc } = req.body;
  const { user } = req;

  //if the there is default location remove the default from it
  if (defLoc)
    await models.Location.updateOne(
      {
        default: defLoc,
        userId: user.id,
      },
      { $set: { default: false } }
    );

  //check if there is a location with this name
  const addressExist = await models.Location.findOne({
    addressName,
    userId: user.id,
  });

  if (addressExist)
    return next(
      new AppError("Location name already exist try different name", 409)
    );

  //create a new location
  const newAddress = await models.Location.create({
    ...req.body,
    userId: user.id,
  });

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: newAddress,
  });
};

//edit user address
export const updateAddress = async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;
  const { addressName, address, default: defLoc } = req.body;

  //check address exist
  const addressExist = await models.Location.findOne({
    _id: id,
    userId: user.id,
  });

  if (!addressExist) return next(new AppError("Address not found", 404));

  //   update address info
  if (addressName) addressExist.addressName = addressName;
  if (address) addressExist.address = address;
  if (defLoc) {
    //remove default address first
    await models.Location.updateOne(
      {
        _id: { $ne: addressExist.id },
        default: defLoc,
        userId: user.id,
      },
      { $set: { default: false } }
    );
    addressExist.default = defLoc;
  }

  //save the address
  await addressExist.save();

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    data: { ...addressExist._doc, userId: undefined },
  });
};

//delete user address
export const deleteAddress = async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  //get existing address
  const addressExist = await models.Location.findOne({
    _id: id,
    userId: user.id,
  });

  if (!addressExist) return next(new AppError("Address not found", 404));

  //delete the doc
  await addressExist.deleteOne();

  res
    .status(200)
    .json({ success: true, message: "Address deleted successfully" });
};
