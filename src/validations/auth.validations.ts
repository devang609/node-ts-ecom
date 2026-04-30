import Joi from "joi";

export const loginValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .pattern(new RegExp("^[a-z0-9]+@gmail.com"))
    .messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email",
      "string.pattern.base": "Email must end with @gmail.com",
    }),
  password: Joi.string().min(8).max(20).required().messages({
    "any.required": "password can't b empty",
    "string.min": "password must be at least 8 characters",
    "string.max": "password must be at most 20 characters",
  }),
});

export const signupValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .pattern(new RegExp("^[a-z0-9]+@gmail.com"))
    .messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email",
      "string.pattern.base": "Email must end with @gmail.com",
    }),
  password: Joi.string().min(8).max(20).required().messages({
    "any.required": "password can't b empty",
    "string.min": "password must be at least 8 characters",
    "string.max": "password must be at most 20 characters",
  }),
});
