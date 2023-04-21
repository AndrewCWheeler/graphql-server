import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import pkg from 'body-parser';
import db from './config/mongoose.config.js';
import { resolvers } from './resolvers.js';
import { typeDefs } from './models/typeDefs.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
// const { JWT_SECRET } = process.env;

interface MyContext {
  token?: String;
}
// const getToken = (user: any) =>
//   jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7 days' });

const { json } = pkg;
const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  json(),
  expressMiddleware(server, {
    context: async ({ req }): Promise<MyContext> => ({
      token: req.headers.authorization,
    }),
  })
);

await new Promise<void>((resolve) =>
  httpServer.listen({ port: 4000 }, resolve)
);
console.log(`🚀 Server ready at http://localhost:4000/graphql`);
console.log(`📗 Connected to db`, db?.connections[0].name);
