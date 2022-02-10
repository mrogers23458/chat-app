const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth')
const { PubSub } = require('graphql-subscriptions')
const { Message } = require('../models')


const pubsub = new PubSub()
const messages = []; // stores all the messages sent
const subscribers = [] // stores any new messsages sent upon listening

const resolvers = {
    Query: { //gets all messages
        messages: () => messages,
    },
    
    Mutation: {//post new messages and return id of each message
        postMessage:(parent, { user, text }) => {
            const id = messages.length; // create an id for the new message
            messages.push({id, user, text})
            Message.create({ user, text })
            subscribers.forEach((fn) => fn)
            return id;
        }
    },
    
    Subscription: { 
        messages: {
            subscribe: (parent, args) => {
                console.log(args, pubsub)
                const channel = Math.random().toString(36).slice(2,15)
                //create random number as teh channel to publish messages to
                const onMessagesUpdates = (fn) => subscribers.push(fn)
                //push the user to the subscriber with onMessagesUpdates function
                //publish updated messages array to the channel as the callback
                onMessagesUpdates(() => pubsub.publish(channel, {messages}))
                

                //publish all messages immediately once a user subscribed
                setTimeout(() => pubsub.publish(channel, { messages }), 0 )

                return pubsub.asyncIterator(channel)
            },
        },
    },
};

module.exports = resolvers