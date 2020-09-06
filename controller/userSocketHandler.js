
class UserSocketHandler {
    constructor() {
      if (!UserSocketHandler.instance) {
        this.userSockets = {};
        this.players = {};
        this.playerData={};
        this.roomData={
            "room-1":{
                
            }
        };
        UserSocketHandler.instance = this;
      }
      Object.freeze(UserSocketHandler.instance);
      return UserSocketHandler.instance;
    }
  
    getUserSocket(userId) {
      if (Object.keys(this.userSockets).indexOf(userId) !== -1) {
        return this.userSockets[userId];
      }
      return null;
    }
  
    getPlayerId(socketId) {
      if (Object.keys(this.players).indexOf(socketId) !== -1) {
        return this.players[socketId];
      }
      return null;
    }
  
    setUserSocket(userId, socket) {
      if (userId !== undefined && userId != null && userId !== "undefined" && userId !== "null") {
        this.userSockets[userId] = socket;
        this.setPlayerId(userId, socket.id);
      }
    }
  
    setPlayerId(playerId, socketId) {
      this.players[socketId] = playerId;
    }
  
    removeUserSocket(userId) {
      if (userId !== undefined && userId != null && userId !== "undefined" && userId !== "null" && this.userSockets[userId]) {
        delete this.players[this.userSockets[userId].id];
        // this.userSockets[userId].removeAllListeners();
        // this.userSockets[userId].disconnect(true);
        delete this.userSockets[userId];
      }
    }
  
    kickUser(userId) {
      this.userSockets[userId].disconnect(true);
    }
    addPlayerData(data){
        this.playerData[data.id] = data;
    }
    removePlayerData(data){
        delete this.playerData[data.id];
    }
    getPlayerData(playerId){
        return  this.playerData[playerId]
    }
    joinRoom(roomId,)
  }
  
  // const instance = new UserSocketHandler();
  
  module.exports = UserSocketHandler;
  