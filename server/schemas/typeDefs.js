const { gql } = require('apollo-server-express')

const typeDefs = gql `
type Message {
    id: ID!
    user: String!
    text: String!
}

type Query {
    messages: [Message!]
}

type Mutation {
    postMessage(user: String!, text:String!): ID!
}

type Subscription {
    messages: [Message!]
}
`

module.exports = typeDefs