import { cloudUpload } from "../utils/index.utils.js";

export const multiUploader = ({ fieldName, allowedExtensions }) =>
  cloudUpload(allowedExtensions).array(fieldName);

export const singleUploader = ({ fieldName, allowedExtensions }) =>
  cloudUpload(allowedExtensions).single(fieldName);
