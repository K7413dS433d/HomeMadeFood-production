import joi from "joi";
import * as utils from "../utils/index.utils.js";
import * as constants from "../common/constants/index.constant.js";
import * as validators from "../common/validators/index.validators.js";

const dataSchema = joi
  .object({
    displayName: joi.string().when(joi.ref("$role"), {
      is: constants.roles.CHEF,
      then: joi.required(),
      otherwise: joi.optional(),
    }),
    description: joi.string().when(joi.ref("$role"), {
      is: constants.roles.CHEF,
      then: joi.required(),
      otherwise: joi.optional(),
    }),
    facebookPageLink: joi
      .string()
      .pattern(constants.URL_REG)
      .message("facebook link not valid"),
    instagramPageLink: joi
      .string()
      .pattern(constants.URL_REG)
      .message("instagram link not valid"),
    paymentMethod: joi
      .array()
      .items(joi.string().valid(...Object.values(constants.paymentMethod)))
      .min(1)
      .when(joi.ref("$role"), {
        is: constants.roles.CHEF,
        then: joi.required(),
        otherwise: joi.optional(),
      }),
    termsAccepted: joi
      .boolean()
      .when(joi.ref("$role"), {
        is: constants.roles.CHEF,
        then: joi.required().valid(true),
        otherwise: joi.optional(),
      })
      .messages({
        "any.only": "Terms and conditions must be accepted",
        "any.required": "Terms and conditions field is required",
      }),
    kitchenAddress: validators.locationSchema.when(joi.ref("$role"), {
      is: constants.roles.CHEF,
      then: joi.required(),
      otherwise: joi.optional(),
    }),
    openSchedule: joi
      .object({
        days: joi
          .array()
          .items(joi.string().valid(...Object.values(constants.days)))
          .min(1)
          .required(),
        fromTime: joi
          .string()
          .required()
          .pattern(constants.TIME_REG)
          .message("in valid time format"),
        toTime: joi
          .string()
          .required()
          .pattern(constants.TIME_REG)
          .message("in valid time format"),
        autoOpenClose: joi.boolean(),
      })
      .when(joi.ref("$role"), {
        is: constants.roles.CHEF,
        then: joi.required(),
        otherwise: joi.optional(),
      }),
  })
  .required();

export const switchRoleDataValidation = utils.asyncHandler(
  async (req, res, next) => {
    let err;
    if (req.user.role == constants.roles.USER) {
      if (!req.user.paymentMethod) {
        const dataToValidate = {
          ...req.body,
          role: constants.roles.CHEF,
        };
        const { error } = dataSchema.validate(req.body, {
          abortEarly: false,
          context: { role: constants.roles.CHEF },
        });
        err = error;
      }
    }
    if (err) {
      const errors = err.details.map((error) => error.message);
      return next(new utils.AppError(errors, 400));
    }
    next();
  }
);
