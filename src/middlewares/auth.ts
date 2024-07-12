// src/middleware/authenticateMiddleware.ts
import { AuthenticationError } from 'apollo-server-express';
import Jwt, { JwtPayload } from 'jsonwebtoken';
import UserModel  from '../firebase/models/User';
import { Request, Response, NextFunction } from 'express';
import UserRequest from '../types/type';

const authenticateMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
     try {
    const auth = req.headers.authorization;

    if (auth) {
      const token = auth.split(' ')[1];
      const verified = Jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      if (verified) {
        const { id } = verified;
        const user = await UserModel.findById(id);

        if (user) {
          req.user = user; 
        }
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
  }

  next ()
};

export default authenticateMiddleware;
