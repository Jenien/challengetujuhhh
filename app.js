require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require('morgan');
const { PORT, SENTRY_DSN, ENV } = process.env;
const Sentry = require('@sentry/node');
const socketHandler = require('./handler/socketHandler');
const app = express();
const server = http.createServer(app);

// Inisialisasi Sentry
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
  environment: ENV,
});

app.use(morgan('dev'));
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.set('view engine', 'ejs');

// Routing untuk halaman root (contoh penggunaan EJS)
app.get('/', (req, res, next) => {
  res.render('templates/activation-email', { name: 'ok', url: 'https://google.com' });
});

// Routing API v1 untuk autentikasi
const authRouter = require('./routes/auth.routes');
app.use('/api/v1/auth', authRouter);

app.use(Sentry.Handlers.errorHandler());


// Error handling untuk route yang tidak ditemukan (404)
app.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: 'Not found',
    error: null,
    data: null,
  });
});

const io = socketIO(server);
socketHandler.initSocket(io);
// Error handling untuk error internal server (500)
app.use((err, req, res, next) => {
  res.status(500).json({
    status: false,
    message: 'Internal server error',
    error: err.message,
    data: null,
  });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {
  io,app,
};
