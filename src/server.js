require('dotenv').config();
const { ApolloServer } = require('apollo-server');

const { typeDefs } = require('./types');
const { resolvers } = require('./resolvers');

const server = new ApolloServer({ typeDefs, resolvers });
const PORT = process.env.PORT ? process.env.PORT : 4000;

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
