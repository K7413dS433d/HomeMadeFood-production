//email regex
export const EMAIL_REG = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

//password regex
export const PASSWORD_REG =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,20}$/;

//phone number regex
export const PHONE_REG = /^01[0125]\d{8}$/;  

//url  regex
export const URL_REG= /https?:\/\/(www\.)?[a-zA-Z0-9\-._~%]+(\.[a-zA-Z]{2,})+(:\d+)?(\/[^\s]*)?/;

//time
export const TIME_REG= /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/
