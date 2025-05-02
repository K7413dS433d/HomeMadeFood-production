import joi from "joi";

export const fileValidatorType = (imgFiledName) =>
  joi.object({
    fieldname: joi.string().valid(imgFiledName).required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    size: joi.number().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
  });
