import Joi from 'joi';

export const loginValidationSchema = Joi.object({
    email: Joi.string().email().required().message('Email is required')
        .pattern(new RegExp("^[a-z0-9]+@gmail.com"), 'Email must end with @gmail.com'),
    password: Joi.string().min(8).max(20).required().message('password can\'t b empty'),
})

export const signupValidationSchema = Joi.object({
    email: Joi.string().email().required().message('Email is required')
        .pattern(new RegExp("^[a-z0-9]+@gmail.com"), 'Email must end with @gmail.com'),
    password: Joi.string().min(8).max(20).required().message('password can\'t b empty'),
})
