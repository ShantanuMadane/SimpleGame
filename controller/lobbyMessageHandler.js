const shortid = require("shortid");
const ConfigModule = require("../utils/config.js");
const UserSocketHandler = require("./userSocketHandler");
const { ERROR } = require("./constants.js");
const NanoTimer = require("nanotimer");

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
      this.db
        .collection("players")
        .update({ id: playerData.id }, { $set: playerData }, (err, data) => {
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
        });
    } catch (err) {
      console.error("error in save player", err);
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
        this.savePlayer(playerData, (err, res) => {
          if (!err) {
            console.log("saved player successfully");
            this.userSockets.removePlayerData(playerData.id);
          }
        });
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
          console.log("INSIDE NEW GUEST", socketData);
          this.savePlayer(newPlayerData, (err, data) => {
            if (!err) {
              console.log("NEW DATA SAVED SUCCESSFULLY");
              this.userSockets.addPlayerData(newPlayerData);
              console.log("SETTING USER SOCKET", newPlayerData.id);
              this.userSockets.setUserSocket(newPlayerData.id, socket);
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
          console.log("old guest player");
          this.db
            .collection("players")
            .findOne({ id: socketData.guestToken }, (err, result) => {
              if (err) {
                console.log("Player do not exist");
                callback({
                  status: ERROR.DATABASE_ERROR,
                  message: "Login unsuccessful"
                });
              } else {
                console.log("Player exist");
                const newPlayerData = {
                  id: socketData.guestToken,
                  diamonds: result.diamonds,
                  gold: result.gold,
                  wins: 0
                };
                this.userSockets.addPlayerData(newPlayerData);
                console.log("SETTING USER SOCKET", newPlayerData.id);
                this.userSockets.setUserSocket(newPlayerData.id, socket);
                callback({ status: ERROR.OK, message: "Login successful" });
              }
            });
        }
      }
    } catch (err) {
      console.error(err.stack);
      callback({ status: ERROR.UNKNOWN, data: {}, message: "Server error." });
    }
  }
  findAndJoinMatch(socket, socketData, callback) {
    try {
      console.log("FIND AND JOIN MATCH");
      const playerId = socketData.id;
      const playerData = this.userSockets.getPlayerData(playerId);
      const roomData = this.userSockets.getRoomData("room-1");
      roomData["roundStartTimer"] = new NanoTimer();
      const playerGameData = {
        id: playerData.id,
        score: 0,
        gold: playerData.gold,
        diamonds: playerData.diamonds,
        roundCount: 0,
        maxRewardPercent: 0
      };
      this.userSockets.joinRoom("room-1", playerGameData);

      const roomPlayers = Object.keys(roomData["playerData"]);
      console.log("ROOM PLAYER ID's", roomPlayers);
      if (roomPlayers.length > 3) {
        const playerTurnId = this.getNextPlayerTurn("room-1");
        console.log("playerTurnId======>", playerTurnId);
        const timer = new NanoTimer();
        for (var i = 0; i < roomPlayers.length; i++) {
          var playerSocket = this.userSockets.getUserSocket(roomPlayers[i]);
          setTimeout(() => {
            console.log("EMITTING GAME START");
            playerSocket.emit("gameStart", { playerTurnId });
            const currentPlayerSocket = this.userSockets.getUserSocket(
              playerTurnId
            );
            if (playerTurnId == roomPlayers[i]) {
              console.log("EMITTING TURN START", playerTurnId);
              currentPlayerSocket.emit("turnStart", {
                nextTurnId: playerTurnId
              });
            }
            this.userSockets.roomData["room-1"]["roundStartTimer"] = timer;
          }, 3000);
          timer.setTimeout(
            this.diceRoll.bind(this),
            [playerTurnId, "room-1"],
            "27s"
          );
        }
      }
      callback({
        status: ERROR.OK,
        message: "finding and joining match successful"
      });
    } catch (err) {
      console.log("error in findMatch", err);
    }
  }
    getNextPlayerTurn(roomId) {
        try {
            const roomData = this.userSockets.getRoomData(roomId);
            const playerIds = Object.keys(roomData["playerData"]);
            console.log("INSIDE getNextPlayerTurn", playerIds);
            var selectedPlayerId = playerIds[0];
            var findMinRoundCount = roomData["playerData"][playerIds[0]].roundCount;
            for (var i = 0; i < playerIds.length; i++) {
             //   console.log("getNextPlayerTurn ", roomData["playerData"][playerIds[i]]);

                console.log(
                    "findMinRoundCount",
                    findMinRoundCount,
                    roomData["playerData"][playerIds[i]].roundCount
                );
                if (
                    findMinRoundCount > roomData["playerData"][playerIds[i]].roundCount
                ) {
                    findMinRoundCount = roomData["playerData"][playerIds[i]].roundCount;
                    selectedPlayerId = playerIds[i];
                }
            }
            console.log("selectedPlayerId2====>", selectedPlayerId);
            return selectedPlayerId;
        } catch (err) {
            console.error("error in getNextPlayerTurn", err);
        }
    }
  diceRoll(playerTurnId, roomId, callback) {
    try {
      console.log("DICE ROLL CALLED");

      const roomData = this.userSockets.getRoomData(roomId);
      roomData["roundStartTimer"].clearTimeout();
      const playerData = roomData["playerData"][playerTurnId];
      const timer = new NanoTimer();
      // random Dice Roll
      const randomNumber = parseInt(Math.random() * 100 + 1, 10);
      let diceOutcome = 0;
      if (playerData.maxRewardPercent < 30) {
        diceOutcome = this.randomRoll(randomNumber);
      } else {
        diceOutcome = this.riggedRoll(playerData, randomNumber);
      }
      const roomPlayers = Object.keys(roomData["playerData"]);
      console.log("ROUND COUNT BEFORE", playerData.roundCount, playerData.id);
      playerData.roundCount += 1;
      console.log("ROUND COUNT AFTER", playerData.roundCount);
      playerData.score += diceOutcome;
      const getNextPlayerTurn = this.getNextPlayerTurn(roomId);
      for (var i = 0; i < roomPlayers.length; i++) {
        this.userSockets
          .getUserSocket(roomPlayers[i])
          .emit("diceOutcome", { diceOutcome, playerId: playerTurnId });
        if (getNextPlayerTurn == roomPlayers[i]) {
          this.userSockets
            .getUserSocket(roomPlayers[i])
            .emit("turnStart", { nextTurnId: getNextPlayerTurn });
          roomData["roundStartTimer"] = timer;
          timer.setTimeout(
            this.diceRoll.bind(this),
            [getNextPlayerTurn, "room-1"],
            "27s"
          );
        }
      }
    } catch (err) {
      console.error("error in diceRoll", err);
    }
  }
  randomRoll(randomNumber) {
    const outcome = {
      dice1: 1,
      dice2: 2,
      dice3: 3,
      dice4: 4,
      dice5: 5,
      dice6: 6
    };
    if (1 <= randomNumber <= 15) {
      return outcome.dice1;
    }
    if (16 <= randomNumber <= 30) {
      return outcome.dice2;
    }
    if (31 <= randomNumber <= 55) {
      return outcome.dice3;
    }
    if (56 <= randomNumber <= 80) {
      return outcome.dice4;
    }
    if (81 <= randomNumber <= 90) {
      return outcome.dice5;
    }
    if (91 <= randomNumber <= 100) {
      return outcome.dice6;
    }
  }
  riggedRoll(playerData, randomNumber) {
    const maxRewardPercent = playerData.maxRewardPercent;
    const outcome = {
      dice1: 1,
      dice2: 2,
      dice3: 3,
      dice4: 4,
      dice5: 5,
      dice6: 6
    };
    if (maxRewardPercent > randomNumber) {
      playerData.maxRewardPercent = 0;
      return outcome.dice6;
    } else {
      playerData.maxRewardPercent += 10;
      if (1 <= randomNumber <= 15) {
        return outcome.dice1;
      }
      if (16 <= randomNumber <= 30) {
        return outcome.dice2;
      }
      if (31 <= randomNumber <= 55) {
        return outcome.dice3;
      }
      if (56 <= randomNumber <= 80) {
        return outcome.dice4;
      }
      if (81 <= randomNumber <= 90) {
        return outcome.dice5;
      }
      if (91 <= randomNumber <= 100) {
        return outcome.dice6;
      }
    }
  }
}

module.exports = LobbyMessageHandler;
