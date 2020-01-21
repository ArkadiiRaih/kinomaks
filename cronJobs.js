const CronJob = require("cron").CronJob;
const { client } = require("./bd");
const {
  makeQueryUpdate,
  makeQueryUpdatePrizes,
  randomGenerator
} = require("./utilities");

// make cron that runs every 00.00 (moscow tz)
new CronJob(
  "0 0 0 * * *",
  async function() {
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
  },
  null,
  true,
  "Europe/Moscow"
);

async function prizesCronJob(prizeQueue) {
  const querySelect = {
    text: `SELECT * from prizes where quantity>0`,
    values: []
  };
  return new CronJob(
    "0 */91 * * * *",
    async function() {
      try {
        const { rows } = await client
          .query(querySelect)
          .catch(err => console.error(err));
        prizes = [...rows];
        if (prizes.length == 0) return;
        let idx = randomGenerator(prizes.length - 1)();
        const prize = prizes[idx];
        prizeQueue.push(prize);
        const queryUpdate = makeQueryUpdatePrizes(prize.id);
        await client.query(queryUpdate);
      } catch (e) {
        console.error(e);
        return;
      }
    },
    null,
    true,
    "Europe/Moscow"
  );
}

module.exports = { prizesCronJob };
