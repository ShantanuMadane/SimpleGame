const ioclient = require("socket.io-client");
class GatewayServer {

  static instance = null;

  constructor() {
    this.gateway = ioclient(process.env.GATEWAY_IP);
    this.Config = require("../utils/config").getInstance();
    this.attachListeners();
    setInterval(this.sendConnectionDataToGateway.bind(this), 5000);
  }

  static getInstance() {
    if (!GatewayServer.instance) {
      GatewayServer.instance = new GatewayServer();
    }
    return GatewayServer.instance;
  }

  attachListeners() {
    console.log("INSIDE ATTACH LISTENER")
    this.gateway.on("connect", () => {
      console.log("GATEWAY CONNECTED THROUGH LOBBY");  
      console.log(`lobby ${process.env.SERVER_NAME} connected to gateway`);
      this.sendEvent("new_lobby", { serverName: process.env.SERVER_NAME });
    });
  }

  sendEvent(eventname, data) {
    console.log(`EVENT [${eventname}], [${JSON.stringify(data)}]`);
    if (this.gateway) {
      this.gateway.emit(eventname, data);
    } else {
      this.Log.debug("no gateway wtf");
    }
  }

  sendConnectionDataToGateway() {
    try {
      if (!this.Config) {
        console.log(`no config`);
        return;
      }
      this.Config.RedisClient.get(`${process.env.SERVER_NAME}_totalConnections`, (err, reply) => {
        const totalConnections = reply ? parseInt(reply, 10) : 0;
        const lobbyServerData = {
          totalConnections,
          serverName: process.env.SERVER_NAME,
          serverUrl: process.env.SERVER_URL,
        };
        this.gateway.emit("lobby_connect_details", lobbyServerData, (callback) => {
          if (callback.status !== 200) {
           console.log(`error in sending lobby_connect_details ${callback.error}`);
          }
        });
      });
    } catch (err) {
      console.log(`[ERROR] when sending lobby balance to gateway ${err.stack}`);
    }
  }
}

module.exports = GatewayServer;
