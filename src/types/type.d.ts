// src/schema/type.ts
import { Request } from 'express';
import { User } from '../firebase/models/User';

interface UserRequest extends Request {
  user?: User; 
}

export default UserRequest;
