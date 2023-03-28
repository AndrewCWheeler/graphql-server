import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './models/typeDefs.js';
import { resolvers } from './resolvers.js';
import db from './config/mongoose.config.js';

console.log(`📗 Connected to db`, db?.connections[0].name);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});
console.log(`🚀 Server ready at: ${url}`);
