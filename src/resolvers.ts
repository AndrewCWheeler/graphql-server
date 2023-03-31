import bcrypt from 'bcryptjs';
import User from './models/user.model.js';
import TaskList from './models/taskList.model.js';
import ToDo from './models/todo.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authenticate from './middleware/jwt.middleware.js';
import mongoose from 'mongoose';
dotenv.config();
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
    getTaskList: async (_: any, { id }, { token }) => {
      const user = await authenticate(token);
      if (!user) {
        throw new Error('Authentication Error. Please sign in');
      }
      const result = await (
        await TaskList.findOne({ _id: id })
      ).populate('users');

      return result;
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
    addUserToTaskList: async (_: any, { taskListId, userId }, { token }) => {
      const user = await authenticate(token);
      if (!user) {
        throw new Error('Authentication Error. Please sign in');
      }
      const taskList = await TaskList.findOne({ _id: taskListId });
      if (!taskList) return null;
      if (taskList.users.find((dbId) => dbId === userId)) {
        return taskList;
      }

      const result = await TaskList.findOneAndUpdate(
        { _id: taskListId },
        {
          $push: {
            users: userId,
          },
        },
        { new: true }
      ).populate('users');
      console.log(result);
      return result;
    },
    deleteTaskList: async (_: any, { id }, { token }) => {
      const user = await authenticate(token);
      if (!user) {
        throw new Error('Authentication Error. Please sign in');
      }
      const result = await TaskList.deleteOne({ _id: id });
      const deletedCount: number = result.deletedCount;
      console.log(deletedCount);
      return deletedCount === 1;
    },

    createToDo: async (_: any, { content, taskListId }, { token }) => {
      const user = await authenticate(token);
      if (!user) {
        throw new Error('Authentication Error. Please sign in');
      }
      // const dbTaskList = await TaskList.find({ _id: taskListId });
      const newToDo = new ToDo({
        content,
        taskList: new mongoose.Types.ObjectId(taskListId),
      });
      const result = await (
        await newToDo.save()
      ).populate({
        path: 'taskList',
      });
      console.log(`result: ${result}`);
      return result;
    },
    updateToDo: async (_: any, data: any, { token }) => {
      const { id } = data;
      const user = await authenticate(token);
      if (!user) {
        throw new Error('Authentication Error. Please sign in');
      }
      const result = ToDo.findOneAndUpdate(
        { _id: id },
        {
          $set: data,
        }
      );
      return result;
    },
    deleteToDo: async (_: any, { id }, { token }) => {
      const user = await authenticate(token);
      if (!user) {
        throw new Error('Authentication Error. Please sign in');
      }
      const result = await ToDo.deleteOne({ _id: id });
      const deletedCount: number = result.deletedCount;
      console.log(deletedCount);
      return deletedCount === 1;
    },
  },

  User: {
    id: ({ _id, id }) => _id || id,
  },

  TaskList: {
    id: ({ _id, id }) => _id || id,
    progress: async ({ _id }) => {
      const todos = await ToDo.find({ taskList: _id });
      const completed = todos.filter((todo) => todo.isCompleted);
      if (todos.length === 0) {
        return 0;
      }
      return (100 * completed.length) / todos.length;
    },
    users: async ({ userIds }) => {
      return Promise.all(
        userIds.map((userId: any) => User.findOne({ _id: userId }))
      );
    },
    todos: async ({ _id }) => await ToDo.find({ taskList: _id }),
  },
  ToDo: {
    id: ({ _id, id }) => _id || id,
    taskList: async ({ taskList }) => await TaskList.findOne({ _id: taskList }),
  },
};
