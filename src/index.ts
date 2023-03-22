import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const { DB_URI, DB_NAME } = process.env;

const typeDefs = `#graphql
  type Query {
    myTaskLists: [TaskList!]!
  }

  type Mutation {
    signUp(input: SignUpInput): AuthUser!
    singIn(input: SignInInput): AuthUser!
  }

  input SignUpInput {
    email: String!
    password: String!
    name: String!
    avatar: String
  }

  input SignInInput {
    email: String!
    password: String!
  }

  type AuthUser {
    user: User!
    token: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String
  }
  type TaskList {
    id: ID!
    createdAt: String!
    title: String!
    progress: Float!

    users: [User!]!
    todos: [ToDo!]!
  }
  type ToDo {
    id: ID!
    content: String!
    isCompleted: Boolean!

    # taskListId: ID!
    taskList: TaskList
  }
`;

const client = new MongoClient(DB_URI, {});

const resolvers = {
  Query: {
    myTaskLists: () => [],
  },
  Mutation: {
    signUp: async (_parent: any, { input }) => {
      await client.connect();
      const db = client.db(DB_NAME);
      const hashedPassword = bcrypt.hashSync(input.password);
      console.log(hashedPassword);
      const user = {
        ...input,
        password: hashedPassword,
      };
      // save to database
      const result = await db.collection('Users').insertOne(user);
      console.log(result);
    },
    // signIn: () => {},
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const start = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log(`🚀 Server ready at: ${url}`);
};

start();
