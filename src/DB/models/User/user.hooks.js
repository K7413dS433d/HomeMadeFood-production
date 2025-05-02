import { encrypt, hashPassword } from "../../../utils/index.utils.js";

export const dataHashing = function (next) {
  if (this.isModified("password"))
    this.password = hashPassword({ password: this.password });
  if (this.isModified("phone")) this.phone = encrypt({ data: this.phone });

  return next();
};
