import EventEmitter from "events";
import { sendEmail } from "./send-email.js";
import { otpTemplate } from "./htm-generator.js";

export const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", async ({ email, otp }) => {
  await sendEmail({
    to: email,
    html: otpTemplate(otp),
  });
});
