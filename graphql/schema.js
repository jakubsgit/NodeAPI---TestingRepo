const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        image: String!
        creater: User!
        createAt: String!
        updatedAt: String!
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        posts: [Post!]
    }

    input UserInputData {
        email: String!
        name: String!
        password: String
    }

    type RootQuery {
        hello: String
    }
    type RootMutation {
        createUser(userInput: UserInputData): User!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
