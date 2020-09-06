const express = require("express");
const gatewayModel = require("../model/gatewayModel.js").getInstance();
const Config = require("../utils/config").getInstance();

const router = express.Router();

function balanceLoad() {
  const balance = gatewayModel.getBalance();
  console.log("BALANCE====>",balance);
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
  if (playerId) {
    Config.RedisClient.get(playerId.concat("_", "LOBBYIP"), (err, reply) => {
      if (err) {
        const url = balanceLoad();
        console.log(
          `[Error occured] normal logic used for Load balancing, url: ${url}`
        );
        res.end(`${url}`);
        return;
      }
      if (!reply) {
        const url = balanceLoad();
        console.log(
          `No player in redis, normal logic used for Load balancing, url: ${url}`
        );
        res.end(`${url}`);
        return;
      }
      console.log(
        `Player found in redis, connected already to server: ${reply}`
      );
      res.end(`${reply}`);
    });
  } else {
    const url = balanceLoad();
    console.log(
      `No player provided, normal logic used for Load balancing, url: ${url}`
    );
    res.end(`${url}`);
  }
});

module.exports = router;
