const { gql } = require('apollo-server');

const typeDefs = gql`
  input LoginInput {
    email: String!
    pass: String!
  }

  input UserInput {
    firstname: String!
    lastname: String!
    email: String!
    pass: String!
  }

  type User {
    userid: Int
    firstname: String
    lastname: String
    email: String
  }

  interface BaseResponse {
    jwt: String
    statusCode: Int
    message: String
  }


  type ManyUsersResponse implements BaseResponse {
    jwt: String
    statusCode: Int
    message: String
    users: [User]
  }

  type OneUserResponse implements BaseResponse {
    jwt: String
    statusCode: Int
    message: String
    user: User
  }

  type AuthResponse implements BaseResponse {
    jwt: String
    statusCode: Int
    message: String
    loggedIn: Boolean
  }

  type Query {
    getAllUsers: ManyUsersResponse
    getUser(userid: Int): OneUserResponse
  }

  type Mutation {
    createUser(user: UserInput): OneUserResponse
    deleteUser(userid: Int): OneUserResponse
    loginUser(credentials: LoginInput): AuthResponse
  }
`;

module.exports = { typeDefs };
