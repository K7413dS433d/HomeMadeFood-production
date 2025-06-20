import { Router } from "express";
import * as locationSchema from "./location.validation.js";
import * as locationService from "./location.service.js";
import { validateSchema } from "../../middleware/index.middlewares.js";
import { asyncHandler } from "../../utils/index.utils.js";
import { roles } from "../../common/constants/index.constant.js";
import {
  isAuthenticated,
  isAuthorized,
  isVerified,
} from "../../middleware/index.middlewares.js";

const locationRouter = Router();

// apply authenticating and authorization to all end points
locationRouter.use(
  isAuthenticated(process.env.BEARER_KEY),
  isAuthorized(roles.USER),
  isVerified
);

//get all user addresses
locationRouter.get("/", asyncHandler(locationService.getAllAddresses));

//add address
locationRouter.post(
  "/",
  validateSchema(locationSchema.addAddress),
  asyncHandler(locationService.addAddress)
);

//update address
locationRouter.patch(
  "/:id",
  validateSchema(locationSchema.updateAddress),
  asyncHandler(locationService.updateAddress)
);

//delete address
locationRouter.delete(
  "/:id",
  validateSchema(locationSchema.deleteAddress),
  asyncHandler(locationService.deleteAddress)
);

export default locationRouter;
