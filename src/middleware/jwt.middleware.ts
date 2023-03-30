import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const { JWT_SECRET } = process.env;

const authenticate = async (token: string) => {
  console.log('Called authenticate.');
  if (!token) {
    return null;
  }
  const tokenData = jwt.verify(token, JWT_SECRET) as JwtPayload;
  const user = await User.findOne({ _id: tokenData.id });
  return user;
};

export default authenticate;
