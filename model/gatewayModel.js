class GatewayModel {
    constructor() {
      this.balance = {};
      this.url = {};
    }
  
    static getInstance() {
      if (!this.instance) {
        this.instance = new GatewayModel();
      }
      return this.instance;
    }
  
    setBalance(serverName, count) {
      this.balance[`${serverName}`] = count;
    }
  
    getBalance() {
      return this.balance;
    }
  
    setUrl(serverName, url) {
      this.url[`${serverName}`] = url;
    }
  
    getUrl() {
      return this.url;
    }
  }
  
  module.exports = GatewayModel;
  