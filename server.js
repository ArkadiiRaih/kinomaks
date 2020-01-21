const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const db = require("./bd");
const path = require("path");
const request = require("request");
const { getFakePrize } = require("./storage");
const { prizesCronJob } = require("./cronJobs");
const createShareForm = require("./shareForm");

app.use(express.json());

const prizeQueue = [];

prizesCronJob(prizeQueue);

app.get("/app", function(req, res) {
  res.sendFile(path.join(__dirname, "public", "app", "index.html"));
});

app.post("/app/api/v1/user", async function(req, res) {
  // -> get uid +
  // if user exists:
  // --> update subscribed and liked fields +
  // --> return users attempts +
  // else:
  // --> create user +
  // -> return user attempts +
  const { uid, liked, subscribed, location } = req.body;
  let user = await db.getUserByUid(uid);
  if (user) {
    const { attempts } = await db.updateUser({ uid, liked, subscribed }, user);
    res.send({ attempts: attempts });
    return;
  }
  const attempts = await db.createUser({ uid, liked, subscribed, location });
  res.send({ attempts: attempts });
});

app.get("/app/api/v1/getprize/:uid", async function(req, res) {
  // -> decrement user attempts +
  // if stack of real prizes is not empty:
  // --> get prize from there (if user location allows it) +
  // --> set user as winner +
  // --> add user and prize to winners table +
  // else:
  // --> get fake prize +
  // -> return prize +
  const { uid } = req.params;
  db.useAttempt(uid);
  const user = await db.getUserByUid(uid);
  const fakePrize = getFakePrize();
  const { attempts } = user;
  if (prizeQueue.length == 0 || user.won) {
    res.send(Object.assign(fakePrize, { rest_attempts: attempts }));
    return;
  }
  const prize = prizeQueue[0];
  let { locations } = prize;
  locations = locations.split(", ");
  if (locations.includes(user.location) || locations == []) {
    const prize = prizeQueue.shift();
    db.setWon(uid);
    db.addWinner(user.id, prize.id);
    res.send(Object.assign(prize, { rest_attempts: attempts }));
  }
  res.send(Onject.assign(fakePrize, { rest_attempts: attempts }));
});

app.post("/app/api/v1/getShareForm", async function(req, res) {
  const { title, text, img_url, upload_url } = req.body;
  const canvas = await createShareForm(title, text, img_url);
  const buffer = canvas.toBuffer();
  const filePath = path.join(
    __dirname,
    "public",
    "app",
    "images",
    `-${title.split("/").join("")}-.png`
  );
  fs.writeFileSync(filePath, buffer);
  // const formData = new FormData();
  // formData.append("photo", fs.createReadStream(filePath));
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
  // -> set user reposted field to true
  // -> return user attempts
  const { uid } = req.params;
  let { reposted, attempts } = await db.getUserByUid(uid);
  if (!reposted) {
    attempts = await db.setReposted(uid);
  }
  res.send({ attempts: attempts });
});

app.use(express.static(path.join(__dirname)));

//in prod change certificzte to real one
https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert")
    },
    app
  )
  .listen(443, function() {
    console.log(
      "Example app listening on port 3000! Go to https://localhost:443/"
    );
  });
