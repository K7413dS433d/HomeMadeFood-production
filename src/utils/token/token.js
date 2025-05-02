import jwt from "jsonwebtoken";

export const generateToken = ({
  payload = {},
  secretKey = process.env.JWT_SECRET,
  options = {},
}) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey = process.env.JWT_SECRET }) => {
  return jwt.verify(token, secretKey);
};

//user tokens
export const generateTokens = (user) => {
  const access_token = generateToken({
    payload: { id: user.id, role: user.role },
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
  });
  const refresh_token = generateToken({
    payload: { id: user.id, role: user.role },
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE },
  });
  return { access_token, refresh_token };
};
