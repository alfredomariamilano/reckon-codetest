const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const exphbs = require('exphbs');
const config = require('./config/config');
const router = require('./config/routes');

const app = express();

// To log all HTTP requests
app.use(morgan('dev'));

// To parse HTTP requests' bodies in req.body
app.use(bodyParser.json({type: 'application/*'}));
app.use(bodyParser.urlencoded({ extended: true }));

// Allows cross-origin requests from the specified urls
const corsOptions = {
  origin: function(origin, callback) {
    if (origin !== undefined) {
      const reckonRegex = /^(https?:\/\/(?:.+\.)?reckon\.com.au(?::\d{1,5})?)$/;
      if (reckonRegex.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(null, true);
    }
  },
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// View engine
app.engine('hbs', exphbs);
app.set('view engine', 'hbs');

// To use the available routes in the router
app.use(router);

// Error handler
app.use((err, req, res, next) => {
  if (err && err.statusCode === 400 && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Could not decode request: JSON parsing failed'
    });
  } else if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Forbidden. Not allowed by CORS'
    });
  }
  next();
});

// App started on specified port
app.listen(config.port, () => console.log(`Express started on port: ${config.port}`));
