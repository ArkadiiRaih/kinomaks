function compose(...funs) {
  return pipe(...funs.reverse());
}

function pipe(...fns) {
  return function piped(v) {
    for (let fn of fns) {
      v = fn(v);
    }
    return v;
  };
}

function calcAttempts({ liked, subscribed, reposted = false }) {
  return 1 + (subscribed ? 2 : 0) + (liked ? 1 : 0) + (reposted ? 1 : 0);
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
function randomGenerator(end) {
  return () => Math.floor(Math.random() * (end + 1));
}

module.exports = {
  compose,
  pipe,
  calcAttempts,
  makeQueryUpdate,
  makeQueryUpdatePrizes,
  randomGenerator
};
