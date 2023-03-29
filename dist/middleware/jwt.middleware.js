import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const { JWT_SECRET } = process.env;
const authenticate = async (token) => {
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
