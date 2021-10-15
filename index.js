import cors from 'cors';
import csrf from 'csurf';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import sendgrid from '@sendgrid/mail';
import session from 'express-session';

// Load the dotenv vars
dotenv.config();

// Initialize Sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
console.log('Sendgrid initialized...');

import {
  cartRoutes,
  productRoutes,
  userRoutes,
} from './routes/index.js';

import { isAdmin, isSignedIn } from './util/index.js';

import { getDirname } from './util/index.js';

process.on("unhandledRejection", (error) => {
  console.error(error); // This prints error with stack included (as for normal errors)
  throw error; // Following best practices re-throw error and let the process exit with error code
});

const __dirname = getDirname();
const PORT = process.env.PORT || 5000;
const MONGODB_URL =
  process.env.MONGODB_URL ||
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_DB}.mongodb.net/ecommerce?retryWrites=true&w=majority`;

await mongoose.connect(MONGODB_URL);

console.log(`Mongodb initialized...`);

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  // Parse the body of POST request without bodyParser because it's depricated
  .use(express.urlencoded({ extended: true }))
  .use(express.json())

  // Logger so we can see all requests coming in
  .use((req, _, next) => {
    console.log(`[${req.method}] ${req.path}`);
    if (req.method === 'POST') {
      console.log(`Post Params:\n${JSON.stringify(req.body, null, 2)}`);
    }
    next();
  })

  // Sessions for user based auth
  .use(session({
    secret: 'BilboBagginsBlisteringTea',
    resave: false,
    saveUninitialized: false,
  }))

  // Add some CSRF protection
  .use(csrf())

  // Allow cross origin requests from our heroku site
  .use(cors({
    origin: "https://nameless-beyond-44302.herokuapp.com/",
    optionsSuccessStatus: 200,
  }))

  // Attach some useful stuff to our locals for rendering logic
  .use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.session = req.session;
    res.locals.isSignedIn = isSignedIn(req);
    res.locals.isAdmin = isAdmin(req);

    next();
  })

  // Register the cart routes
  .use('/cart', cartRoutes)

  // Register the user routes
  .use('/users', userRoutes)

  // Register the product routes
  .use('/products', productRoutes)

  // Redirect to the products page by default
  .get('/', (_, res, __) => res.redirect('/products'))

  // // CSRF token error handling
  // .use((err, _, res, next) => {
  //   if (err.code !== 'EBADCSRFTOKEN') { return next(err); }
  //   res.status(403);
  //   res.send('You were being naughty and don\'t have a valid CSRF token...');
  // })

  // Finally listen on the port
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

