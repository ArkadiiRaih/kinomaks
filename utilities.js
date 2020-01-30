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
function randomGenerator(end) {
  return () => Math.floor(Math.random() * (end + 1));
}

module.exports = {
  compose,
  pipe,
  calcAttempts,
  randomGenerator
};
