class ServerSocketHandler {
    static instance = null;
  
    constructor() {
      this.sockets = {};
    }
  
    static getInstance() {
      const instance = new ServerSocketHandler();
      return instance;
    }
  
    setSocket(serverName, socket) {
      if (serverName != undefined && serverName != null && serverName != 'undefined' && serverName != 'null') {
        this.sockets[serverName] = socket;
      }
    }
  
    getSocket(serverName) {
      if (this.sockets[serverName]) {
        return this.sockets[serverName];
      }
      return null;
    }
  
    removeSocket(socket) {
      const keys = Object.keys(this.sockets);
      for (let key in keys) {
        if (!this.sockets[key]) {
          continue;
        }
        if (this.sockets[key].id === socket.id) {
          delete this.sockets[key];
          return;
        }
      }
    }
  }
  
  module.exports = ServerSocketHandler;