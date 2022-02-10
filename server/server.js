const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const http = require('http')
const path = require('path')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { execute, subscribe } = require ('graphql')
const { makeExecutableSchema } = require ('@graphql-tools/schema')

const typeDefs = require('./schemas/typeDefs')
const resolvers = require('./schemas/resolvers')

const { authMiddleware } = require('./utils/auth')

const db = require('./config/connection')

const PORT = process.env.PORT || 3001
const app = express()

async function startApolloServer(typeDefs, resolvers) {
    // Required logic for integrating with Express
    const app = express();
    const httpServer = http.createServer(app);
  
    // Same ApolloServer initialization as before, plus the drain plugin.
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    
    
    const server = new ApolloServer({
        schema,
        plugins: [{async serverWillStart() {
            return { async drainServer() {
                subscriptionServer.close()
            }
        }
    }}, ApolloServerPluginDrainHttpServer({ httpServer }) ],
});
const subscriptionServer = SubscriptionServer.create({
    // This is the `schema` we just created.
    schema,
    // These are imported from `graphql`.
    execute,
    subscribe,
 }, {
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql',
 });


// More required logic for integrating with Express
await server.start();
    server.applyMiddleware({
      app,
      path: '/'
    });

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    db.once('open', async () => {
        // Modified server startup
        await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
      });

  }

  startApolloServer(typeDefs, resolvers);