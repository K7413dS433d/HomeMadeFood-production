import { Router } from "express";
import * as locationSchema from "./location.validation.js";
import * as locationService from "./location.service.js";
import { validateSchema } from "../../middleware/index.middlewares.js";
import { asyncHandler } from "../../utils/index.utils.js";
import { roles } from "../../common/constants/index.constant.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../../middleware/index.middlewares.js";

const locationRouter = Router();

// apply authenticating and authorization to all end points
locationRouter.use(
  isAuthenticated(process.env.TOKEN_USER_VALUE),
  isAuthorized(roles.USER)
);

//get all user addresses
locationRouter.get(
  "/get-user-addresses",
  asyncHandler(locationService.getAllAddresses)
);

//add address
locationRouter.post(
  "/add-address",
  validateSchema(locationSchema.addAddress),
  asyncHandler(locationService.addAddress)
);

//delete address
locationRouter.delete(
  "/delete-address/:id",
  validateSchema(locationSchema.deleteAddress),
  asyncHandler(locationService.deleteAddress)
);

//update address
locationRouter.patch(
  "/update-address/:id",
  validateSchema(locationSchema.updateAddress),
  asyncHandler(locationService.updateAddress)
);

export default locationRouter;
