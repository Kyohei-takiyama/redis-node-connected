// const express = require("express");
// const fetch = require("node-fetch");
// const redis = require("redis");

import express from "express";
import nodeFetch from "node-fetch";
import redis from "redis";

const PORT = process.env.PORT || 4000;
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient(REDIS_PORT);

const app = express();

const setResponse = (username, repos) => {
  return `<h2>${username} has ${repos} Github repos</h2>`;
};

const getRepos = async (req, res, next) => {
  try {
    console.log("Fetching Data...");

    const { username } = req.params;

    const response = await nodeFetch(
      `https://api.github.com/users/${username}`
    );

    const data = await response.json();

    const repos = data.public_repos;

    // await client.connect();
    await client.setex(username, 3600, repos);

    res.send(setResponse(username, repos));
  } catch (error) {
    console.log(error);
  }
};

// cache middleware
function cache(req, res, next) {
  const { username } = req.params;

  console.log("Cache");
  client.get(username, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
}

app.get("/repos/:username", cache, getRepos);

app.listen(PORT, () => console.log("App litening on port " + PORT));
