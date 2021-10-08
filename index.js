import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import session from 'express-session';

// Load the dotenv vars
dotenv.config();

import {
  cartRoutes,
  productRoutes,
  userRoutes,
} from './routes/index.js';

import { getDirname } from './util/index.js';

const __dirname = getDirname();
const PORT = process.env.PORT || 5000;
const MONGODB_URL =
  process.env.MONGODB_URL ||
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_DB}.mongodb.net/ecommerce?retryWrites=true&w=majority`;

await mongoose.connect(MONGODB_URL);

console.log(`Connected to Mongodb!`);

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  // Sessions for user based auth
  .use(session({
    secret: 'BilboBagginsBlisteringTea',
    resave: false,
    saveUninitialized: false,
  }))

  // Allow cross origin requests from our heroku site
  .use(cors({
    origin: "https://nameless-beyond-44302.herokuapp.com/",
    optionsSuccessStatus: 200,
  }))

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

  // Attach the session to the locals so we can access it in the templates
  .use((req, res, next) => {
    res.locals.session = req.session;
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

  // Finally listen on the port
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

