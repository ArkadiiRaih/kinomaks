const { Client } = require("pg");
const { calcAttempts } = require("./utilities");

// Set config
const pgConfig = Object.freeze({
  dbURL: ""
});

// create client
const client = new Client({
  connectionString: pgConfig.dbURL,
  ssl: true
});

// connect to database
client.connect();

async function getUserByUid(uid) {
  const query = {
    text: `SELECT * FROM users WHERE uid=$1`,
    values: [uid]
  };
  try {
    const { rows } = await client.query(query);
    return rows[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function updateUser({ uid, liked, subscribed }, user) {
  const {
    attempts: prevAttempts,
    liked: prevLiked,
    subscribed: prevSubscrubed
  } = user;
  let attempts = prevAttempts;

  if (liked > prevLiked) {
    attempts += 1;
  } else if (liked < prevLiked) {
    attempts -= 1;
  }

  if (subscribed > prevSubscrubed) {
    attempts += 2;
  } else if (subscribed < prevSubscrubed) {
    attempts -= 2;
  }

  const query = {
    text: `UPDATE users
        SET liked=$1,
        subscribed=$2,
        attempts=$3
        WHERE uid=$4 RETURNING *`,
    values: [liked, subscribed, attempts, uid]
  };
  try {
    const { rows } = await client.query(query);
    return rows[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function setReposted(uid) {
  const query = {
    text: `UPDATE users
    SET reposted=true,
    attempts = attempts + 1
    WHERE uid=$1
    RETURNING *`,
    values: [uid]
  };
  try {
    const { rows } = client.query(query);
    const { attempts } = rows[0].user;
    return attempts;
  } catch (e) {
    return null;
  }
}

function createUser({ uid, subscribed, liked, location }) {
  const reposted = false,
    attempts_all = 0,
    attempts = calcAttempts({ liked, subscribed }),
    won = false;

  const query = {
    text: `INSERT INTO
    users(uid, subscribed, liked, reposted, location, won, attempts, attempts_all)
    values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    values: [
      uid,
      subscribed,
      liked,
      reposted,
      location,
      won,
      attempts,
      attempts_all
    ]
  };
  client.query(query).catch(err => console.error(err));
  return attempts;
}

async function updateUsers() {
  const querySelect = {
    text: "SELECT uid, liked, reposted, subscribed from users",
    values: []
  };
  const { rows } = await client.query(querySelect);
  for (let row of rows) {
    const queryUpdate = makeQueryUpdate(row);
    try {
      await client.query(queryUpdate);
    } catch (e) {
      console.error(e);
    }
  }
  return true;
}

function addWinner(user_id, prize_id) {
  const query = {
    text: `INSERT INTO winners 
    (user_id, prize_id) 
    values ($1, $2)`,
    values: [user_id, prize_id]
  };
  client.query(query);
}

function setWon(uid) {
  const query = {
    text: `UPDATE users
    SET won = true
    WHERE uid = $1;`,
    values: [uid]
  };
  client.query(query);
}

function useAttempt(uid) {
  const query = {
    text: `UPDATE users
    SET attempts = attempts - 1, 
    attempts_all = attempts_all + 1
    WHERE uid = $1`,
    values: [uid]
  };
  client.query(query);
}

async function getWinners() {
  const query = {
    text: `SELECt * FROM winners 
  JOIN users ON users.id = winners.user_id
  JOIN prizes ON prizes.id = winners.prize_id`,
    values: []
  };
  const { rows } = client.query(query);
  return rows;
}

async function getPrizes() {
  const query = {
    text: `SELECT * FROM prizes WHERE quantity>0`,
    values: []
  };
  const { rows } = await client.query(query);
  return rows;
}

async function updatePrizes(pid) {
  const queryUpdate = makeQueryUpdatePrizes(pid);
  return await client.query(queryUpdate);
}

function makeQueryUpdate({ uid, liked, reposted, subscribed }) {
  const attempts = calcAttempts({ liked, reposted, subscribed });
  return {
    text: `UPDATE users
    SET attempts=$1,
    won=$2
    WHERE uid=$3 RETURNING *`,
    values: [attempts, false, uid]
  };
}

function makeQueryUpdatePrizes(id) {
  return {
    text: `UPDATE prizes
    SET quantity = quantity - 1
    WHERE id=$1 RETURNING *`,
    values: [id]
  };
}

module.exports = {
  createUser,
  getUserByUid,
  updateUser,
  setReposted,
  setWon,
  addWinner,
  useAttempt,
  client,
  getPrizes,
  updatePrizes,
  updateUsers,
  getWinners
};
