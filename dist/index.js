import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import pkg from 'body-parser';
import { typeDefs } from './models/typeDefs.js';
import { resolvers } from './resolvers.js';
import db from './config/mongoose.config.js';
const { json } = pkg;
const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use('/graphql', cors(), json(), expressMiddleware(server, {
    context: async ({ req }) => ({
        token: req.headers.authorization,
    }),
}));
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);
console.log(`📗 Connected to db`, db?.connections[0].name);
