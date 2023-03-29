import bcrypt from 'bcryptjs';
import User from './models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET } = process.env;

const getToken = (user: any) =>
  jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7 days' });

export const resolvers = {
  Query: {
    myTaskLists: () => [],
  },
  Mutation: {
    signUp: async (_: any, { input }) => {
      const hashedPassword = bcrypt.hashSync(input.password);
      console.log(hashedPassword);
      const newUser = new User({
        ...input,
        password: hashedPassword,
      });
      console.log(newUser);
      // save to database
      const result = await newUser.save();

      return {
        user: result,
        token: getToken(newUser),
      };
    },
    signIn: async (_: any, { input }, context: any) => {
      console.log(context);
      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw new Error('Invalid credentials!');
      }
      // check if password is correct
      const isPasswordCorrect = bcrypt.compareSync(
        input.password,
        user.password
      );
      if (!isPasswordCorrect) {
        throw new Error('Invalid credentials');
      }
      return {
        user,
        token: getToken(user),
      };
    },
  },
  // May need this if not using Mongoose:
  //   User: {
  //     id: ({ _id, id }) => _id || id,
  //   },
};
