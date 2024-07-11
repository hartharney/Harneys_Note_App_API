// src/middleware/authenticateMiddleware.ts
import { AuthenticationError } from 'apollo-server-express';
import Jwt, { JwtPayload } from 'jsonwebtoken';
import UserModel  from '../firebase/models/User';
import { Request, Response, NextFunction } from 'express';
import UserRequest from '../types/type';

const authenticateMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const auth = req.headers.authorization;

        if (!auth) {
            throw new AuthenticationError('Unauthorized, no token provided');
        }

        const token = auth.split(' ')[1];
        const verified = Jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        if (!verified) {
            throw new AuthenticationError('Unauthorized');
        }

        const { id } = verified;
        const user = await UserModel.findById(id);

        if (!user) {
            throw new AuthenticationError('Unauthorized');
        }

        req.user = user;
        console.log("req.user", req.user);
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        throw new AuthenticationError('Failed to authenticate');
    }
};

export default authenticateMiddleware;
