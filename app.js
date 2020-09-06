var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const Config = require("./utils/config").getInstance();
const gatewayRouter = require("./routes/gateway");
const balanceRouter = require("./routes/balance");

var app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use("/gateway", gatewayRouter);
app.use("/balance", balanceRouter);

// catch 404 and forward to error handler
app.use((req, res, next)=> {
  next(createError(404));
});

// error handler
app.use((err, req, res, next)=> {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


function socketGatewayListeners(socket) {
  socket.on("ping", (data, cb) => { GatewayMessageHandler.ping(socket, data, cb); });
  socket.on("new_lobby", (data) => { GatewayMessageHandler.newLobby(socket, data); });
  socket.on("lobby_connect_details", (data, cb) => { GatewayMessageHandler.handleLobbyConnections(socket, data, cb); });
}

io.on("connection", (socket) => {
  console.log("New socket connection");
  socketGatewayListeners(socket);
});

function safeExit(signal) {
  console.log(`[GATEWAY-${signal}] Safe exit happen`);
  Config.RedisClient.flushall((err, success) => {
    if (err) {
      console.log("[ERROR] cleaning redis keys when gateway exit");
    }
    if (success) {
      console.log("[SUCCESS] cleaned redis keys");
    }
    process.exit(1);
  });
}
process.on("exit", () => safeExit("EXIT"));
process.on("SIGINT", () => safeExit("SIGINT"));
process.on("SIGHUP", () => safeExit("SIGHUP"));
process.on("uncaughtException", (err) => {
  console.error(err, "Uncaught Exception thrown");
  safeExit("uncaughtException");
});

app.listen(process.env.PORT_NUMBER, () => {
  console.log(`SimpleGame app listening at http://localhost:${process.env.PORT_NUMBER}`)
})
module.exports = app;
