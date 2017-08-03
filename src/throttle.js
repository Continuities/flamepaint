function doTheThing (callAfter, fn, delay) {
  let lastCall = null;
  let delayedCall = null;
  return function() {
    delayedCall && clearTimeout(delayedCall);
    delayedCall = false;
    if (!lastCall || Date.now() - lastCall > delay) {
      fn(...arguments);
      lastCall = Date.now();
    }
    else if (callAfter) {
      delayedCall = setTimeout(fn.bind(null, ...arguments), delay - (Date.now() - lastCall));
    }
  };
}

export const throttle = doTheThing.bind(null, true);
export const debounce = doTheThing.bind(null, false);