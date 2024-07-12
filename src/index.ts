import express from 'express';
import session from 'express-session';
import { ApolloServer } from 'apollo-server-express';
import resolvers from './schema/resolvers';
import typeDefs from './schema/typeDefs';
import dotenv from 'dotenv';
import authenticateMiddleware from './middlewares/auth';
import auth from './routes/callBackRoutes';
import UserRequest from './types/type';
import { Request, Response } from 'express';
import passport from 'passport';
import cors from 'cors';


dotenv.config();

const { PORT, SESSION_SECRET } = process.env;
console.log(`PORT: ${PORT}`);

const context = async ({ req, res }: { req: UserRequest; res: Response }) => {
  const currentPath = req.headers['x-current-path'] as string;
  const shouldApplyMiddleware = currentPath !== '/register' && currentPath !== '/login';


  if (shouldApplyMiddleware) {
    await new Promise<void>((resolve, reject) => {
      authenticateMiddleware(req, res, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  const user = req.user;
  return { user, req, res };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

const startServer = async () => {
   const app = express();
    app.use(
    session({
        secret: SESSION_SECRET || 'your_session_secret_here',
        resave: false,
        saveUninitialized: false,
    })
    );
    app.use(express.json());
    app.use(cors({ origin: '*', credentials: true }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Auth routes
    app.use(auth);
  
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });

      };

startServer().catch(error => {
  console.error('Error starting server:', error);
});
