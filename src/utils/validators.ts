import Joi from 'joi';

class Validate {
    static registerUserSchema = Joi.object({
        email: Joi.string().trim().lowercase().email().required().messages({
            "string.base": "Email should be a string",
            "string.empty": "Email is required",
            "string.email": "Invalid email format",
            "any.required": "Email is required",
        }),
        firstName: Joi.string().required().messages({
            "string.base": "First Name should be a string",
            "string.empty": "First Name is required",
            "any.required": "First Name is required",
        }),
        lastName: Joi.string().required().messages({
            "string.base": "Last Name should be a string",
            "string.empty": "Last Name is required",
            "any.required": "Last Name is required",
        }),
        password: Joi.string()
            .trim()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{3,18}$/)
            .required()
            .messages({
                "string.base": "Password should be a string",
                "string.empty": "Password is required",
                "string.pattern.base": "Password must contain at least one lowercase letter, one uppercase letter, and one number",
                "any.required": "Password is required",
            }),
        confirmPassword: Joi.string().equal(Joi.ref("password")).required().label("Confirm password").messages({
            "any.only": "Passwords do not match",
            "any.required": "Confirm password is required",
        }),
    });

    static loginUserSchema = Joi.object({
        email: Joi.string().trim().lowercase().required().messages({
            "string.base": "Email should be a string",
            "string.empty": "Email is required",
            "any.required": "Email is required",
        }),
        password: Joi.string()
            .trim()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#_!*%$])[a-zA-Z0-9@#_!*%$]{3,18}$/)
            .required()
            .messages({
                "string.base": "Password should be a string",
                "string.empty": "Password is required",
                "string.pattern.base": "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@#_!*%$)",
                "any.required": "Password is required",
            }),
    });
}

export default Validate;
