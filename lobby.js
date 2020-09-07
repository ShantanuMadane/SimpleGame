const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const configInstance = require("./utils/config.js").getInstance();
const GatewayServer = require("./controller/lobbyGatewayConnectionHandler");
const LobbyMsgHandler = require("./controller/lobbyMessageHandler");
const { ERROR } = require("./controller/constants.js");

let LobbyMessageHandler = null;

configInstance.loadConfigs(() => {
  GatewayServer.getInstance();
  LobbyMessageHandler = LobbyMsgHandler.getInstance();
  console.log("LOAD CONFIG DONE ON LOBBY");
});

function socketLobbyListeners(socket) {
  socket.on("ping_lobby", (data, cb) => {
    LobbyMessageHandler.ping(data, cb);
  });
  socket.on("disconnect", data => {
    configInstance.RedisClient.decr(
      process.env.SERVER_NAME.concat("_", "totalConnections")
    );
    LobbyMessageHandler.disconnect(socket, data);
    console.log(`${io.engine.clientsCount} users connected`);
  });
  socket.on("login", (data, cb) => {
    //Increase roomno 2 clients are present in a room.
    if (
      io.nsps["/"].adapter.rooms["room-" + roomno] &&
      io.nsps["/"].adapter.rooms["room-" + roomno].length > 3
    ){
      console.log("As of now allowng only 4 players to join the room")
      return;
      // roomno++;
    }
    socket.join("room-" + roomno);
    //Send this event to everyone in the room.
    io.sockets.in("room-" + roomno).emit("connectToRoom", "You are in room no. " + roomno);
    LobbyMessageHandler.login(socket, data, cb);
  });
  socket.on("findAndJoinMatch",(data,cb)=>{
    LobbyMessageHandler.findAndJoinMatch(socket, data, cb);
  });
  socket.on("playerDiceRoll",(data,cb)=>{
    LobbyMessageHandler.playerDiceRoll(socket, data, cb);
  })
}

var roomno = 1;
io.on("connection", socket => {
  console.log(`a user connected socketid--->: ${socket.id}`);
  console.log(`${socket.client.conn.server.clientsCount} users connected`);
  configInstance.RedisClient.incr(
    process.env.SERVER_NAME.concat("_", "totalConnections")
  );

  socketLobbyListeners(socket);
});

app.get("/", (req, res) => {
  res.send("socket server running hola");
});

function safeExit(signal) {
  console.log(`[LOBBY-${signal}] Safe exit happen`);
  if (signal !== "EXIT") {
    // save player data here
  }
}
process.on("exit", () => safeExit("EXIT"));
process.on("SIGINT", () => safeExit("SIGINT"));
process.on("SIGHUP", () => safeExit("SIGHUP"));
process.on("uncaughtException", err => {
  console.error(err, "Uncaught Exception thrown");
  safeExit("uncaughtException");
});

server.listen(process.env.PORT_NUMBER);
