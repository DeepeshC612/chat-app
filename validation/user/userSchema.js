const joi = require("joi");
const { joiPasswordExtendCore } = require("joi-password");
const joipassword = joi.extend(joiPasswordExtendCore);

const schema = {
  registerUser: joi
    .object({
      firstName: joi
        .string()
        .min(2)
        .max(20)
        .messages({
          "string.min": "Username should min {#limit} characters",
          "string.max": "Username should max {#limit} characters",
        })
        .required(),
      lastName: joi
        .string()
        .min(2)
        .max(20)
        .messages({
          "string.min": "Username should min {#limit} characters",
          "string.max": "Username should max {#limit} characters",
        })
        .required(),
      email: joi
        .string()
        .email()
        .message("Provide valid email address")
        .required(),
      password: joipassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(2)
        .noWhiteSpaces()
        .messages({
          "password.minOfUppercase":
            "{#label} should contain at least {#min} uppercase character",
          "password.minOfSpecialCharacters":
            "{#label} should contain at least {#min} special character",
          "password.minOfLowercase":
            "{#label} should contain at least {#min} lowercase character",
          "password.minOfNumeric":
            "{#label} should contain at least {#min} numeric character",
          "password.noWhiteSpaces": "{#label} should not contain white spaces",
        })
        .required(),
      phoneNum: joi
      .string()
      .required(),
      address: joi.string().messages({
        "string.empty": "You must provide your city name, {userName}",
      }),
    })
    .unknown(true),

  LoginUser: joi
    .object({
      email: joi
      .string()
      .email()
      .message("Provide valid email address")
      .required(),
      password: joi.string().required(),
    })
    .unknown(true),
};

module.exports = schema;
