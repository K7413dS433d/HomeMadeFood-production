import models from "../../DB/models/index.models.js";
import * as utils from "../../utils/index.utils.js";
import * as constants from "../../common/constants/index.constant.js";

//registration
export const userSignUp = async (req, res, next) => {
  // create user
  const user = new models.User({
    ...req.body,
    authProvider: constants.authProvider.SYSTEM,
    role: constants.roles.USER,
  });

  // Create user cart
  await models.Cart.create({ user: user._id, cartItems: [] });
  await user.save();

  //otp creation
  await utils.createOtp({ email: user.email });

  //Generate tokens
  const tokens = utils.generateTokens(user);

  return res.status(201).json({
    success: true,
    massage: "signUp Successfully",
    data: {
      ...tokens,
      user,
    },
  });
};

//create chef
export const chefSignUp = async (req, res, next) => {
  const newChef = new models.User({
    ...req.body,
    role: constants.roles.CHEF,
    kitchenStatus: constants.kitchenStatus.OPEN,
    authProvider: constants.authProvider.SYSTEM,
  });

  if (req.file) {
    const profileDir = utils.pathResolver({ path: `Chefs/${newChef.id}` });

    //upload file
    const image = await utils.uploadFile({
      req,
      options: { folder: profileDir, fileName: "profilePic" },
    });
    // Create user cart
    await models.Cart.create({ user: newChef._id, cartItems: [] });
    //add image
    newChef.image = image;
  }

  await newChef.save();

  await utils.createOtp({ email: newChef.email });

  const tokens = utils.generateTokens(newChef);

  res.status(201).json({
    success: true,
    massage: "signUp Successfully",
    data: {
      newChef,
      ...tokens,
    },
  });
};

//logIn
export const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await models.User.findOne({ email });

  if (!user) {
    return next(new utils.AppError("user not found please sign up ", 404));
  }
  if (!user.verified) {
    return next(new utils.AppError("Please verify your email", 401));
  }
  if (user.deletedAt) {
    const now = new Date();
    // Calculate difference in milliseconds
    const diffMs = now - user.deletedAt;
    // Convert milliseconds to days
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays <= 60) {
      user.deletedAt = undefined;
      await user.save();
    } else {
      return next(
        new utils.AppError(
          "Account has been permanently deleted – over 60 days.",
          401
        )
      );
    }
  }
  if (user.authProvider != constants.authProvider.SYSTEM)
    return next(new utils.AppError("Invalid provider", 400));

  if (user.role == constants.roles.CHEF) {
    user.kitchenStatus = constants.kitchenStatus.OPEN;
    await user.save();
  }

  const isMatch = utils.comparPassword({
    password,
    hashPassword: user.password,
  });

  if (!isMatch) {
    return next(new utils.AppError("Invalid UserName or Password", 401));
  }
  const tokens = utils.generateTokens(user);
  const role = user.role;

  res.status(200).json({
    massage: "Login Successfully",
    success: true,
    data: { ...tokens, role },
  });
};

//Email Verification
export const verifyEmail = async (req, res, next) => {
  const { otp, email } = req.body;
  const otpModel = await models.OTP.findOne({ email });
  const user = await models.User.findOne({ email });
  if (!user)
    return next(new utils.AppError("user not found ,please sign up!", 404));

  if (!otpModel) {
    return next(
      new utils.AppError("code not found, please resend code again! ", 404)
    );
  }

  if (utils.decrypt({ cipher_text: otpModel.otp }) != otp) {
    return next(new utils.AppError("Invalid code", 400));
  }

  await models.User.findByIdAndUpdate(user._id, { verified: true });
  await otpModel.deleteOne({ email });
  res
    .status(200)
    .json({ success: true, massage: "Email Verified Successfully" });
};

//Resend OTP
export const sendOtp = async (req, res, next) => {
  const { email } = req.body;
  const user = await models.User.findOne({ email });

  if (!user) {
    return next(new utils.AppError("user not found please sign up", 404));
  }
  if (user.authProvider != constants.authProvider.SYSTEM)
    return next(
      new utils.AppError("Only system users can perform this action", 400)
    );

  await utils.createOtp({ email });

  res.status(200).json({ success: true, massage: "Code Resend Successfully" });
};

// Verify Email For Password and change password
export const changePassword = async (req, res, next) => {
  const { otp, email } = req.body;
  const user = await models.User.findOne({ email });
  if (!user) {
    return next(new utils.AppError("user not found please sign up", 404));
  }
  if (user.authProvider != constants.authProvider.SYSTEM)
    return next(
      new utils.AppError(
        "You do not have permission to change pass. Only system users can perform this action.",
        400
      )
    );
  const otpModel = await models.OTP.findOne({ email });
  if (!otpModel) {
    return next(
      new utils.AppError("code not found,please resend code again!", 404)
    );
  }
  if (utils.decrypt({ cipher_text: otpModel.otp }) != otp) {
    return next(new utils.AppError("Invalid code", 400));
  } else {
    const { password } = req.body;
    user.password = password;
    await user.save();
  }
  await otpModel.deleteOne({ email });
  res.status(200).json({
    success: true,
    massage: "Password Change Successfully",
  });
};

//Create New Access Token
export const newAccess = async (req, res, next) => {
  const { refresh_token } = req.body;
  const payload = utils.verifyToken({ token: refresh_token });
  const user = await models.User.findById(payload.id);
  if (!user) {
    return next(new utils.AppError("User Not Found!", 400));
  }

  const access_token = utils.generateToken({
    payload: { id: payload.id, role: user.role },
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
  });

  res.status(200).json({
    success: true,
    massage: "New Access Token Generated Successfully",
    data: { access_token },
  });
};

//Google Login or signUp
export const google = async (req, res, next) => {
  const { accessToken, role, firstName, lastName, phone, ...chefData } =
    req.body;

  // get third party user
  const userData = req.thirdPartyUser;
  if (!userData.email_verified)
    return next(new utils.AppError("Email Not Provided", 400));
  //create user
  let user = await models.User.findOne({ email: userData.email });

  if (!user) {
    let data = {
      email: userData.email,
      firstName: firstName || userData.given_name,
      lastName: lastName || userData.family_name || userData.given_name,
      phone,
      authProvider: constants.authProvider.GOOGLE,
      verified: true,
      role: constants.roles.USER,
    };

    //role based data
    if (role == constants.roles.CHEF) {
      data = {
        ...data,
        ...chefData,
        role: constants.roles.CHEF,
      };
    }

    //create user
    user = new models.User(data);

    if (userData.picture) {
      req.imageUrl = userData.picture;
      //folder to save profile picture
      const profileDir = utils.pathResolver({ path: `Users/${user.id}` });

      //upload file
      const image = await utils.uploadFile({
        req,
        options: { folder: profileDir, fileName: "profilePic" },
      });
      //add image
      user.image = image;
    }
    user = await user.save();
  }
  if (user.authProvider != constants.authProvider.GOOGLE)
    return next(new utils.AppError("Invalid provider", 400));

  //Generate tokens
  const tokens = utils.generateTokens(user);

  res.status(200).json({
    success: true,
    massage: "Done",
    data: { ...tokens },
  });
};

//facebook login or signUp
export const facebook = async (req, res, next) => {
  const { accessToken, role, firstName, lastName, phone, ...chefData } =
    req.body; // Get the token from the frontend
  // get third party user
  const userData = req.thirdPartyUser;

  let user = await models.User.findOne({ email: userData.email });
  if (!user) {
    let data = {
      email: userData.email,
      firstName: firstName || userData.first_name,
      lastName: lastName || userData.last_name || userData.first_name,
      phone,
      authProvider: constants.authProvider.FACEBOOK,
      verified: true,
      role: constants.roles.USER,
    };
    //role based data
    if (role == constants.roles.CHEF) {
      data = {
        ...data,
        ...chefData,
        role: constants.roles.CHEF,
      };
    }

    user = new models.User(data);

    if (userData.picture?.data?.url) {
      req.imageUrl = userData.picture.data.url;
      //folder to save profile picture
      const profileDir = utils.pathResolver({ path: `Users/${user.id}` });

      //upload file
      const image = await utils.uploadFile({
        req,
        options: { folder: profileDir, fileName: "profilePic" },
      });
      //add image
      user.image = image;
    }
    user = await user.save();
  }
  if (user.authProvider !== constants.authProvider.FACEBOOK) {
    return next(new utils.AppError("Invalid provider", 400));
  }

  //Generate tokens
  const tokens = utils.generateTokens(user);

  res.status(200).json({
    message: "Done",
    data: {
      ...tokens,
    },
  });
};
