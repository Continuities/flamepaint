module.exports = function (fn, delay) {
  let lastCall = null;
  let delayedCall = null;
  return function() {
    delayedCall && clearTimeout(delayedCall);
    delayedCall = false;
    if (!lastCall || Date.now() - lastCall > delay) {
      fn(...arguments);
      lastCall = Date.now();
    }
    else {
      delayedCall = setTimeout(fn.bind(null, ...arguments), delay - (Date.now() - lastCall));
    }
  };
}