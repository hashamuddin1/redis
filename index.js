const express = require("express");
const app = express();
const Redis = require("ioredis");
const redis = new Redis();
const axios=require("axios")


const setResponse = (username, value) => {
  return `${username} has ${value} repository`;
};

async function cache(req, res, next) {
  const { username } = req.params;
  await redis.get(username, (err, dataValue) => {
    if (err) throw err;
    if (dataValue !== null) {
      console.log("Fetching data with redis");
      return res.send(setResponse(username, dataValue));
    } else {
      next();
    }
  });
}

app.get("/get/repository/:username", cache, async (req, res) => {
  console.log("Fetching data without redis");

  const { username } = req.params;

  const response = await axios(`https://api.github.com/users/${username}`);

  await redis.set(username, response.data.public_repos);

  return res.send(setResponse(username, response.data.public_repos));
});

app.delete("/delete/repository/:username", async (req, res) => {
  console.log("Delete redis key");

  const { username } = req.params;

  await redis.del(username);

  return res.send({ status: true, message: "Delete redis key" });
});

app.listen(8080, () => {
  console.log("server is listening on 8080");
});
