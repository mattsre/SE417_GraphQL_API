const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

const knex = require('knex')({
  client: process.env.DB_CONNECTOR,
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_PRIMARY_DB,
  },
});

const resolvers = {
  BaseResponse: {
    __resolveType: (response) => {
      if (response.users) return 'ManyUsersResponse';
      if (response.user) return 'OneUserResponse';
      if (response.loggedIn) return 'AuthResponse';
      return null;
    },
  },
  Query: {
    getAllUsers: async () => {
      const allUsers = await knex.select().from('users');
      return {
        statusCode: 200,
        message: `Successfully found ${allUsers.length} users.`,
        users: allUsers,
      };
    },
    getUser: async (_, { userid }) => {
      const [user] = await knex('users').where('userid', userid);
      return {
        statusCode: 200,
        message: `Successfully found user with ID: ${userid}.`,
        user,
      };
    },
  },
  Mutation: {
    createUser: async (_, { user }) => {
      const localUser = user;
      localUser.pass = await bcrypt.hash(localUser.pass, saltRounds);
      const [createdUser] = await knex('users').returning(['userid', 'firstname', 'lastname', 'email']).insert(localUser);
      const signedJWT = await jwt.sign({
        userid: createdUser.userid,
        email: createdUser.email,
        scope: {
          dashboard: true,
        },
      }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return {
        jwt: signedJWT,
        statusCode: 200,
        message: `Successfully created user with ID: ${createdUser.userid}.`,
        user: createdUser,
      };
    },
    deleteUser: async (_, { userid }) => {
      const [deletedUser] = await knex('users').returning(['userid', 'firstname', 'lastname', 'email']).where('userid', userid).del();
      return {
        statusCode: 200,
        message: `Successfully deleted user with ID: ${deletedUser.userid}.`,
        user: deletedUser,
      };
    },
    loginUser: async (_, { credentials }) => {
      const [foundUser] = await knex('users').column('pass').where('email', credentials.email);

      if (foundUser) {
        if (await bcrypt.compare(credentials.pass, foundUser.pass)) {
          const signedJWT = await jwt.sign({
            userid: foundUser.userid,
            email: foundUser.email,
            scope: {
              dashboard: true,
            },
          }, process.env.JWT_SECRET, { expiresIn: '1h' });

          return {
            jwt: signedJWT,
            statusCode: 200,
            message: 'Successfully logged in!',
            loggedIn: true,
          };
        }

        return {
          statusCode: 401,
          message: 'Incorrect credentials, please try again.',
          loggedIn: false,
        };
      }

      if (foundUser === undefined) {
        return {
          statusCode: 401,
          message: 'No User Account found with that email.',
          loggedIn: false,
        };
      }

      return {
        statusCode: 500,
        message: 'The server encountered an error, please try again!',
        loggedIn: false,
      };
    },
  },
};

module.exports = { resolvers };
