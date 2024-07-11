import bcryptjs, { genSalt } from "bcryptjs";
import Joi from "joi";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// generate token
export const generateToken = async (email: string, id: string) => {
  return Jwt.sign({ email, id }, process.env.JWT_SECRET as string, {
    expiresIn: "3d",
  });
};

// validate token
export const verify = async (token: string) => {
  try {
    const verified = Jwt.verify(token, process.env.JWT_SECRET as string);
    return verified;
  } catch (error) {
    return "invalid token";
  }
};

//Encoding
export const bcryptEncoded = async (value: { value: string }) => {
  return bcryptjs.hash(value.value, await genSalt());
};

//decoding
export const bcryptDecode = (password: string, comparePassword: string) => {
  return bcryptjs.compare(password, comparePassword);
};

export const generatePasswordResetToken = (): number => {
  return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
};

//hashing
export const hashPassword = (password: string): Promise<string> => {
  return bcryptjs.hash(password, bcryptjs.genSaltSync());
};

export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};