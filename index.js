const express    = require('express')
const bodyParser = require('body-parser');
const path       = require('path')

const PORT = process.env.PORT || 5000

const productRoutes = require('./routes/products');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

  // Parse the body of POST requests
  .use(bodyParser({ extended: false }))

  // Logger so we can see all requests coming in
  .use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    if (req.method === 'POST') {
      console.log(`Post Params:\n${JSON.stringify(req.body, null, 2)}`);
    }
    next();
  })

  .use('/products', productRoutes)
  .get('/', (req, res, next) => res.redirect('/products'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
