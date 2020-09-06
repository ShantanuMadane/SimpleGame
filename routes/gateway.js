const express = require("express");
const gatewayModel = require("../model/gatewayModel.js").getInstance();
const Config = require("../utils/config").getInstance();

const router = express.Router();

function balanceLoad() {
  const balance = gatewayModel.getBalance();
  const url = gatewayModel.getUrl();
  const keys = Object.keys(balance);

  let minLoad = balance[keys[0]];
  let connectionUrl = url[keys[0]];
  for (let i = 0; i < keys.length; i += 1) {
    if (balance[keys[i]] <= minLoad) {
      connectionUrl = url[keys[i]];
      minLoad = balance[keys[i]];
    }
  }
  return connectionUrl;
}

router.get("/", (req, res) => {
  res.setHeader("Connection", "close");
  let playerId = req.query.id;
  const fbId = req.query.fb_id;
  if (fbId) {
    playerId = fbId;
  }
  if (playerId) {
    Config.RedisClient.get(playerId.concat("_", "LOBBYIP"), (err, reply) => {
      if (err) {
        const url = balanceLoad(res);
        console.log(
          `[Error occured] normal logic used for Load balancing, url: ${url}`
        );
        res.end(`${url}_${Config.getConfig().CHAT_SERVER_IP}`);
        return;
      }
      if (!reply) {
        const url = balanceLoad(res);
        console.log(
          `No player in redis, normal logic used for Load balancing, url: ${url}`
        );
        res.end(`${url}_${Config.getConfig().CHAT_SERVER_IP}`);
        return;
      }
      console.log(
        `Player found in redis, connected already to server: ${reply}`
      );
      res.end(`${reply}_${Config.getConfig().CHAT_SERVER_IP}`);
    });
  } else {
    const url = balanceLoad(res);
    console.log(
      `No player provided, normal logic used for Load balancing, url: ${url}`
    );
    res.end(`${url}_${Config.getConfig().CHAT_SERVER_IP}`);
  }
});

module.exports = router;
