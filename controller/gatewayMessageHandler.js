
const ServerSockets = require("../controller/serverSocketHandler");
const GatewayModel = require("../model/gatewayModel.js").getInstance();
const Config = require("../utils/config.js").getInstance();
Config.loadConfigs(() => {
    console.log("configuration loaded successfully");
});
module.exports = {
    ping: (socket, socketData, callback) => {
        console.log("Inside ping");
        console.log(socketData);
        const serverSockets = ServerSockets.getInstance();
        const server = serverSockets.getSocket(socketData.serverName);
        if (server) {
            server.emit("pong", {});
        }
        callback({ status: 200 });
    },
    newLobby: (socket, socketData) => {
        console.log(`[GATEWAY] new lobby: ${JSON.stringify(socketData)}`);
        const serverSockets = ServerSockets.getInstance();
        serverSockets.setSocket(socketData.serverName, socket);
        Config.RedisClient.set(socketData.serverName.concat("_", "totalConnections"), 0);
    },
    handleLobbyConnections: (socket, socketData, callback) => {
        GatewayModel.setBalance(socketData.serverName, socketData.totalConnections);
        GatewayModel.setUrl(socketData.serverName, socketData.serverUrl);
        callback({ status: 200 });
    },

};
