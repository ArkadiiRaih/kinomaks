const CronJob = require("cron").CronJob;
const { getPrizes, updatePrizes, updateUsers } = require("./db");
const { randomGenerator } = require("./utilities");

// make cron that runs every 00.00 (moscow tz)
// reset users attempts
// starts immediatelly
new CronJob(
  "0 0 0 * * *",
  async function() {
    await updateUsers();
  },
  null,
  true,
  "Europe/Moscow"
);

// push prize from database to provided prizes queue every 91 minute
// if there are no more prizes, just returns
async function prizesCronJob(prizeQueue) {
  return new CronJob(
    "0 */91 * * * *",
    async function() {
      try {
        const prizes = await getPrizes();
        if (prizes.length == 0) return;
        let idx = randomGenerator(prizes.length - 1)();
        const prize = prizes[idx];
        prizeQueue.push(prize);
        await updatePrizes(prize.id);
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
