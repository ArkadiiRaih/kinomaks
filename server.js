const express = require("express");
const https = require("https");
const fs = require("fs");
const db = require("./db");
const path = require("path");
const request = require("request");
const { getFakePrize } = require("./fakePrizesStorage");
const { prizesCronJob } = require("./cronJobs");
const createShareForm = require("./shareForm");

const app = express();
app.use(express.json());

// start adding prizes to prize queue
const prizeQueue = [];
prizesCronJob(prizeQueue);

app.get("/app", function(req, res) {
  res.sendFile(path.join(__dirname, "public", "app", "index.html"));
});

app.post("/app/api/v1/user", async function(req, res) {
  const { uid, liked, subscribed, location } = req.body;
  let user = await db.getUserByUid(uid);
  if (user) {
    const { attempts } = await db.updateUser({ uid, liked, subscribed }, user);
    res.send({ attempts: attempts });
    res.end();
    return;
  }
  const attempts = await db.createUser({ uid, liked, subscribed, location });
  res.send({ attempts: attempts });
  res.end();
});

app.get("/app/api/v1/getprize/:uid", async function(req, res) {
  const { uid } = req.params;
  db.useAttempt(uid);
  const user = await db.getUserByUid(uid);
  const fakePrize = getFakePrize();
  const { attempts } = user;
  if (prizeQueue.length == 0 || user.won) {
    res.send(Object.assign(fakePrize, { rest_attempts: attempts }));
    res.end();
    return;
  }
  const prize = prizeQueue[0];
  let { locations } = prize;
  locations = locations.split(", ");
  if (locations.includes(user.location) || locations == []) {
    prize = prizeQueue.shift();
    db.setWon(uid);
    db.addWinner(user.id, prize.id);
    res.send(Object.assign(prize, { rest_attempts: attempts }));
    res.end();
  }
  res.send(Object.assign(fakePrize, { rest_attempts: attempts }));
  res.end();
});

app.post("/app/api/v1/getShareForm", async function(req, res) {
  const { title, text, img_url, upload_url } = req.body;
  const filePath = path.join(
    __dirname,
    "public",
    "app",
    "images",
    `-${title.split("/").join("")}-.png`
  );
  if (!fs.existsSync(filePath)) {
    const canvas = await createShareForm(title, text, img_url);
    const buffer = canvas.toBuffer();
    fs.writeFileSync(filePath, buffer);
  }
  request.post(
    {
      url: upload_url,
      formData: { photo: fs.createReadStream(filePath) }
    },
    (err, response, body) => {
      res.send(body);
    }
  );
});

app.get("/app/api/v1/setReposted/:uid", async function(req, res) {
  const { uid } = req.params;
  let { reposted, attempts } = await db.getUserByUid(uid);
  if (!reposted) {
    attempts = await db.setReposted(uid);
  }
  res.send({ attempts: attempts });
});

app.use(express.static(path.join(__dirname)));
//in production, change certificate to real one
https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert")
    },
    app
  )
  .listen(5000, function() {
    console.log(
      "Example app listening on port 3000! Go to https://localhost:5000/"
    );
  });
