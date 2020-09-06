const express = require("express");
const gatewayModel = require("../model/gatewayModel.js").getInstance();

const router = express.Router();

router.get("/", (req, res) => {
  res.setHeader("content-type", "text/html");
  const balance = gatewayModel.getBalance();
  const url = gatewayModel.getUrl();
  const keys = Object.keys(balance);
  console.log(keys);
  let html = "<style>table, tr, th, td{border:1px solid black; border-collapse: collapse;padding-left:5px;padding-right:5px;}</style><br><center><table>";
  html += "<tr><th>SERVERNAME</th><th>BALANCE</th></tr>";
  for (let i = 0; i < keys.length; i += 1) {
    html += `<tr><td>${keys[i]}</td><td>${balance[keys[i]]}</td></tr><br>`;
  }
  res.send(`</table>${html}`);
});

module.exports = router;
