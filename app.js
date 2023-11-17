require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT,SENTRY_DSN , ENV } = process.env;
const Sentry = require ('@sentry/node');

Sentry.init({
  dsn:SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app })
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  environment:ENV 
});

app.use(morgan('dev'));
app.use(express.json());
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.set('view engine', 'ejs');
app.get('/', (req, res, next) => {
  res.render('templates/activation-email', 
  { name: 'ok', url: 'https://google.com' });
});

const authRouter = require('./routes/auth.routes');
app.use('/api/v1/auth', authRouter);
// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.use ((req,res,next) =>{
  res.status(404).json({
    status:false,
    message:'not found',
    error:null,
    data:null
  });
});

app.use ((err, req,res,next) =>{
  res.status(500).json({
    status:false,
    message:'intern al server eror',
    error:err.message,
    data:null
  });
});


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));