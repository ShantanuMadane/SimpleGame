const shortid = require("shortid");
const ConfigModule = require("../utils/config.js");
const UserSocketHandler = require("./userSocketHandler");
const { ERROR } = require("./constants.js");
const NanoTimer = require('nanotimer');

class LobbyMessageHandler {
    static instance = null;
    constructor() {
        this.Config = ConfigModule.getInstance();
        this.db = null;
        this.Config.loadConfigs(() => {
            this.db = this.Config.getDB();
        });
        this.userSockets = new UserSocketHandler();
    }
    static getInstance() {
        if (!LobbyMessageHandler.instance) {
            LobbyMessageHandler.instance = new LobbyMessageHandler();
        }
        return LobbyMessageHandler.instance;
    }
    savePlayer(playerData, callback) {
        try {
            if (!this.db) {
                return callback({
                    status: ERROR.DATABASE_ERROR,
                    data: {},
                    message: "Database error."
                });
            }
            this.db.collection("players").save(playerData, (err, data) => {
                if (!err) {
                    console.log("Saved player successfully", playerData.id);
                    callback(null);
                } else {
                    return callback({
                        status: ERROR.DATABASE_ERROR,
                        data: {},
                        message: "Database error."
                    });
                }
            })

        } catch (err) {
            console.error("error in save player",err);
            callback({
                status: ERROR.DATABASE_ERROR,
                data: {},
                message: "Database error."
            });
        }
    }
    disconnect(socket, socketdata) {
        try {
            const playerId = this.userSockets.getPlayerId(socket.id);
            const playerData = this.userSockets.getPlayerData(playerId);
            if (playerData) {
                // save player and do other important events
                this.savePlayer(playerData,(err,res)=>{
                    if(!err){
                        console.log("saved player successfully");
                        this.userSockets.removePlayerData(playerData.id)
                    }
                })
            }
            this.userSockets.removeUserSocket(playerId);
           
            console.log(`User disconnect:  ${playerId}`);
            console.log(
                `socketid->playerid map : ${JSON.stringify(this.userSockets.players)}`
            );
        } catch (err) {
            console.error(err.stack);
            callback({
                status: ERROR.UNKNOWN,
                data: {},
                message: "Unknown error."
            });
        }
    }
    login(socket, socketData, callback) {
        try {
             
            console.log(`login event socketdata: ${JSON.stringify(socketData)}`);
            if (!this.db) {
                callback({
                    status: ERROR.DATABASE_ERROR,
                    data: {},
                    message: "Database error."
                });
                return;
            }
            if (socketData.accountType === "guest") {
                if (!socketData.guestToken) {
                    // new player
                    const newPlayerData = {
                        id: shortid.generate(),
                        diamonds: 100,
                        gold: 500,
                        wins: 0
                    };
                    console.log("INSIDE NEW GUEST",socketData);
                    this.savePlayer(newPlayerData, (err, data) => {
                        if (!err) {
                            console.log("NEW DATA SAVED SUCCESSFULLY")
                            this.userSockets.addPlayerData(newPlayerData);
                            console.log("SETTING USER SOCKET",newPlayerData.id)
                            this.userSockets.setUserSocket(newPlayerData.id,socket)
                            callback({ status: ERROR.OK, message: "Login successful" });
                        } else {
                            callback({
                                status: ERROR.DATABASE_ERROR,
                                message: "Login unsuccessful"
                            });
                        }
                    });
                } else {
                    // old guest player
                    console.log("old guest player")
                    this.db.collection("players").findOne(
                        { id: socketData.guestToken },
                        (err, result) => {
                            if (err) {
                                console.log("Player do not exist")
                                callback({
                                    status: ERROR.DATABASE_ERROR,
                                    message: "Login unsuccessful"
                                });
                            } else {
                                console.log("Player exist")
                                const newPlayerData = {
                                    id: socketData.guestToken,
                                    diamonds: result.diamonds,
                                    gold: result.gold,
                                    wins: 0
                                };
                                this.userSockets.addPlayerData(newPlayerData);
                                console.log("SETTING USER SOCKET",newPlayerData.id)
                                this.userSockets.setUserSocket(newPlayerData.id,socket)
                                callback({ status: ERROR.OK, message: "Login successful" });
                            }
                        }
                    );
                }
            }
        } catch (err) {
            console.error(err.stack);
            callback({ status: ERROR.UNKNOWN, data: {}, message: "Server error." });
        }
    }
    findAndJoinMatch(socket,socketData,callback){
        try{
            console.log("FIND AND JOIN MATCH")
          const playerId = socketData.id;
          const playerData = this.userSockets.getPlayerData(playerId);
          const roomData = this.userSockets.getRoomData("room-1");
          const playerGameData = {
              id:playerData.id,
              score:0,
              gold:playerData.gold,
              diamonds:playerData.diamonds,
              roundCount:0,
          };
          this.userSockets.joinRoom("room-1",playerGameData);

          const roomPlayers = Object.keys(roomData["playerData"]);
          console.log("ROOM PLAYER ID's",roomPlayers)
          if(roomPlayers.length > 3){
             const playerTurnId = this.getNextPlayerTurn("room-1");
             console.log("playerTurnId======>",playerTurnId)
             for(var i=0;i<roomPlayers.length;i++){
                var playerSocket = this.userSockets.getUserSocket(roomPlayers[i]);
                const timer =  new NanoTimer();
                setTimeout(()=>{
                    playerSocket.emit("gameStart",{playerTurnId});
                    const currentPlayerSocket = this.userSockets.getUserSocket(playerTurnId)
                    currentPlayerSocket.emit("turnStart",{playerTurnId})           
                   // this.userSockets.roomData["room-1"]["roundStartTimer"]=roundStartTimer;
                 }, 3000);
               //  timer.setTimeout(diceRoll, [playerTurnId], '27s');
             }
          }
          callback({status:ERROR.OK,message:"finding and joining match successful"});
        }catch(err){
            console.log("error in findMatch",err);

        }
    }
    getNextPlayerTurn(roomId){
        try{
            const roomData = this.userSockets.getRoomData(roomId);
            const playerIds = Object.keys(roomData["playerData"]);
            console.log("INSIDE getNextPlayerTurn",playerIds)
            var selectedPlayerId = playerIds[0];
            var  findMinRoundCount = playerIds[0].roundCount;
            for(var i=0;i<playerIds.length;i++){
                if(roomData["playerData"][playerIds[i]].roundCount == 0){
                    console.log("selectedPlayerId====>",selectedPlayerId)
                    return selectedPlayerId;
                }else{
                    if(findMinRoundCount < roomData[playerIds[i]].roundCount){
                      findMinRoundCount = roomData[playerIds[i]].roundCount;
                      selectedPlayerId = playerIds[i];
                   
                    }
                }
            }
            console.log("selectedPlayerId2====>",selectedPlayerId)
            return selectedPlayerId

        }catch(err){
            console.error("error in getNextPlayerTurn",err)
        }
    }

}

module.exports = LobbyMessageHandler;
