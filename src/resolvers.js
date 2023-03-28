import bcrypt from 'bcryptjs';
import User from './models/user.model.js';

export const resolvers = {
  Query: {
    myTaskLists: () => [],
  },
  Mutation: {
    signUp: async (_, { input }) => {
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
        token: 'token',
      };
    },
    // signIn: () => {},
  },
};
