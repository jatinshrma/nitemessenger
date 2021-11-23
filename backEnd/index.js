const connectToMongo = require('./db')
const express = require('express');
const cors = require('cors');
const app = express();
const methodOverride = require('method-override');

require('dotenv').config();
app.use(methodOverride('_method'));
app.use(cors())
app.use(express.json());
connectToMongo()

// Routes
app.use('/', require('./routes/messages')),
  app.use('/accounts', require('./routes/account')),
  app.use('/dp', require('./routes/upload')),

  app.listen(process.env.PORT, () => {
    console.log(`Nite Messenger listening at ${process.env.HOST}`)
  })