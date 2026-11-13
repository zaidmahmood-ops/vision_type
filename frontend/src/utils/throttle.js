// Leading + trailing throttle: the last value is never dropped.
export function throttle(fn, wait = 150) {
  let last = 0;
  let timer = null;
  let pendingArgs = null;

  const invoke = () => {
    last = Date.now();
    timer = null;
    const args = pendingArgs;
    pendingArgs = null;
    fn(...args);
  };

  const throttled = (...args) => {
    pendingArgs = args;
    const remaining = wait - (Date.now() - last);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      invoke();
    } else if (!timer) {
      timer = setTimeout(invoke, remaining);
    }
  };

  throttled.cancel = () => {
    clearTimeout(timer);
    timer = null;
    pendingArgs = null;
  };

  return throttled;
}