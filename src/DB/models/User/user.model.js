import { model, Schema, Types } from "mongoose";
import { dataHashing } from "./user.hooks.js";
import { decrypt } from "../../../utils/index.utils.js";
import * as constants from "../../../common/constants/index.constant.js";
import * as validators from "../../../common/validators/index.validators.js";

//matching roles
const isRoleMatching = (role) =>
  function () {
    return role == this.role;
  };

const isDefaultMatching = (role, value) =>
  function () {
    if (role == this.role) return value;
    return;
  };

//schema
const userSchema = new Schema(
  {
    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: [constants.EMAIL_REG, "Enter a valid email address."],
    },

    phone: {
      type: String,
      required: function () {
        return this.authProvider == constants.authProvider.SYSTEM;
      },
      transform: (v) => decrypt({ cipher_text: v }),
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider == constants.authProvider.SYSTEM;
      },
    },

    accountLanguage: {
      type: String,
      enum: Object.values(constants.languages),
      default: constants.languages.ARABIC,
    },

    deletedAt: { type: Date },

    verified: { type: Boolean, default: false },

    authProvider: {
      type: String,
      enum: Object.values(constants.authProvider),
      default: constants.authProvider.SYSTEM,
    },

    role: {
      type: String,
      enum: Object.values(constants.roles),
      default: constants.roles.USER,
    },

    image: {
      secure_url: {
        type: String,
        required: true,
        default: constants.image.secure_url,
      },

      public_id: {
        type: String,
        required: true,
        default: constants.image.public_id,
      },
    },
    //user
    followedChefs: [Types.ObjectId],
    favoriteMeals: [Types.ObjectId],
    //chef
    displayName: {
      type: String,
      required: isRoleMatching(constants.roles.CHEF),
    },
    description: {
      type: String,
      required: isRoleMatching(constants.roles.CHEF),
    },
    facebookPageLink: {
      type: String,
      match: [constants.URL_REG, "Enter a valid URL."],
    },
    instagramPageLink: {
      type: String,
      match: [constants.URL_REG, "Enter a valid URL."],
    },
    kitchenAddress: {
      addressName: {
        type: String,
        required: isRoleMatching(constants.roles.CHEF),
      },
      longitude: {
        type: String,
        required: isRoleMatching(constants.roles.CHEF),
        validate: {
          validator: validators.longitudeValidator,
          message: (props) => `${props.value} is not a valid longitude!`,
        },
      },
      latitude: {
        type: String,
        required: isRoleMatching(constants.roles.CHEF),
        validate: {
          validator: validators.latitudeValidator,
          message: (props) => `${props.value} is not a valid latitude!`,
        },
      },
    },

    openSchedule: {
      days: {
        type: [String],
        enum: Object.values(constants.days),
        required: isRoleMatching(constants.roles.CHEF),
        default: isDefaultMatching(constants.roles.CHEF), //to not stored it in user
      },
      fromTime: {
        type: String, // Use string like "09:00 AM"
        required: isRoleMatching(constants.roles.CHEF),
        match: [constants.TIME_REG, "Enter a valid start time (e.g. 09:00 AM)"],
      },
      toTime: {
        type: String, // Use string like "06:00 PM"
        required: isRoleMatching(constants.roles.CHEF),
        match: [constants.TIME_REG, "Enter a valid end time (e.g. 06:00 PM)"],
      },
      autoOpenClose: {
        type: Boolean,
        default: isDefaultMatching(constants.roles.CHEF, false),
      },
    },

    paymentMethod: {
      type: [String],
      enum: Object.values(constants.paymentMethod),
      required: isRoleMatching(constants.roles.CHEF),
      default: isDefaultMatching(
        constants.roles.CHEF,
        constants.paymentMethod.CASH
      ),
    },
    termsAccepted: {
      type: Boolean,
      required: isRoleMatching(constants.roles.CHEF),
    },
    kitchenStatus: {
      type: String,
      enum: Object.values(constants.kitchenStatus),
      default: isDefaultMatching(constants.roles.CHEF, constants.kitchenStatus.CLOSED),
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a virtual field fullName
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Add a virtual field location
userSchema.virtual("locations", {
  ref: "Location",
  localField: "_id",
  foreignField: "userId",
});

//data hiding hook
userSchema.pre("save", dataHashing);

//model
const User = model("User", userSchema);

export default User;
