const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        image: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        posts: [Post!]
    }
    type AuthData {
        token: String!
        userId: String!
    }
    type PostData {
        posts: [Post!]
        totalPosts: Int!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String
    }
    input PostInputData {
        title: String!
        content: String!
        image: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int!): PostData!
        post(_id: ID!): Post!
        user: User!
    }
    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(_id: ID!, postInput: PostInputData): Post!
        deletePost(_id: ID!): Boolean
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
