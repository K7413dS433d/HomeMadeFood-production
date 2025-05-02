import bcryptjs from "bcryptjs";
export const hashPassword = ({
  password = "",
  saltRound = +process.env.SALT_ROUND,
}) => {
  return bcryptjs.hashSync(password, saltRound);
};

export const comparPassword = ({ password = "", hashPassword = "" }) => {
  return bcryptjs.compareSync(password, hashPassword);
};
