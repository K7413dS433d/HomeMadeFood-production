import joi from "joi";

export const longitudeValidator = (value) =>
  Number(value) >= -180 && Number(value) <= 180;

export const latitudeValidator = (value) =>
  Number(value) >= -90 && Number(value) <= 90;

export const locationValidator = (callback) => {
  return (value, helper) => {
    if (callback(value)) return true;
    const message = `invalid ${callback.name.split("V")[0]}`;
    return helper.message(message);
  };
};

export const locationSchema = joi.object({
  addressName: joi.string().required(),
  longitude: joi
    .string()
    .custom(locationValidator(longitudeValidator))
    .required(),
  latitude: joi
    .string()
    .custom(locationValidator(latitudeValidator))
    .required(),
});
