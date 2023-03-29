import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
dotenv.config();

const { JWT_SECRET } = process.env;

const authenticate = async (token: any) => {
  console.log('Called authenticate.');
  if (!token) {
    return null;
  }
  const tokenData = jwt.verify(token, JWT_SECRET);
  console.log(tokenData);

  // const user = await User.findOne({ _id: tokenData.id });
  // console.log(user);
  // return user;
};

export default authenticate;
