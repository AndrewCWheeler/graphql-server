import bcrypt from 'bcryptjs';
import User from './models/user.model.js';
import TaskList from './models/taskList.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authenticate from './middleware/jwt.middleware.js';
dotenv.config();
import { ObjectId } from 'mongodb';
const { JWT_SECRET } = process.env;

// interface MyResolverArgs {
//   id: ObjectId;
//   title: string;
// }

const getToken = (user: any) =>
  jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7 days' });

export const resolvers = {
  Query: {
    myTaskLists: async (_: any, args: any, { token }) => {
      const user = await authenticate(token);
      const taskLists: any[] = await TaskList.find({ users: user._id });
      return taskLists;
    },
  },
  Mutation: {
    signUp: async (_: any, { input }) => {
      const hashedPassword = bcrypt.hashSync(input.password);
      const newUser = new User({
        ...input,
        password: hashedPassword,
      });
      // save to database
      const result = await newUser.save();
      return {
        user: result,
        token: getToken(newUser),
      };
    },
    signIn: async (_: any, { input }, context: any) => {
      const { authenticatedUser } = context;
      const user = await User.findOne({ email: input.email });
      if (!user) {
        throw new Error('Invalid credentials!');
      }
      const isPasswordCorrect = bcrypt.compareSync(
        input.password,
        user.password
      );
      user && console.log(`authenticatedUser: ${authenticatedUser}`);
      if (!isPasswordCorrect) {
        throw new Error('Invalid credentials');
      }
      return {
        user,
        token: getToken(user),
      };
    },

    createTaskList: async (_: any, { title }, context: any) => {
      const { token } = context;
      const user = await authenticate(token);
      if (!user) {
        throw new Error('Authentication Error. Please sign in');
      }
      console.log(user);
      const newTaskList = new TaskList({
        title,
        progress: 0,
        users: [user],
      });
      const result = await newTaskList.save();
      console.log(`result: ${result}`);
      return result;
    },

    updateTaskList: async (_: any, { id, title }, { token }) => {
      const user = await authenticate(token);
      if (!user) {
        throw new Error('Authentication Error. Please sign in');
      }

      const result = await TaskList.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            title,
          },
        },
        { new: true }
      ).populate('users');
      console.log(result);
      return result;
    },

    // May need these if not using Mongoose:
    // User: {
    //   id: ({ _id, id }) => _id || id,
    // },

    // TaskList: {
    //   id: ({ _id, id }) => _id || id,
    //   progress: () => 0,
    //   users: async ({ userIds }) => {
    //     return Promise.all(
    //       userIds.map((userId: any) => User.findOne({ _id: userId }))
    //     );
    //   },
    // },
  },
};
