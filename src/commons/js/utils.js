export const noop = () => {};

export const trim = (raw = '') => `${raw}`.trim();
export const lowercase = (raw = '') => `${raw}`.toLowerCase();
export const spacesToDashs = (raw = '') => `${raw}`.replace(/\s+/g, '-');

export const rAF = ({ wait } = { wait: 0 }) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(window.requestAnimationFrame);
    }, wait);
  });

export const select = document.querySelector.bind(document);
export const selectAll = document.querySelectorAll.bind(document);
export const setAttrs = (node, attrs = {}) => {
  if (!node) return node; // TODO also check if it is a DOM node

  return Object.keys(attrs).reduce((el, key) => {
    el.setAttribute(key, attrs[key]);
    return el;
  }, node);
};

export const once = (fn, ...args) => {
  let output;
  return () => {
    if (!output) {
      output = fn(...args);
    }
    return output;
  };
};

const body = once(select, 'body');
export const goTo = (view, data = {}, url = `/!#${view}`) => {
  rAF().then(() => {
    body().setAttribute('data-nav', view);
    const current = select('[data-view].active');
    if (current) current.classList.remove('active');

    const next = select(`[data-view=${view}]`);
    if (next) next.classList.add('active');
  });
  
  const state = { ...data, ...{ view } };
  let expandedUrl = data.id ? `${url}/${data.id}` : url;
  expandedUrl = data.test ? `/${data.test}${expandedUrl}` : expandedUrl;

  window.history.pushState(state, '', expandedUrl);
};

export const handleWindowPopState = () => {
  window.onpopstate = ({ state }) => {
    if (!state) return;

    const { view } = state;
    goTo(view);
  };
};

export const exceptId = (map = {}) =>
  Object.keys(map)
    .filter(key => key !== 'id')
    .reduce(
      (partial, key) => ({
        ...partial,
        [key]: map[key]
      }),
      {}
    );
    
/**
 * @param {string} Code code written by candidate
 * @returns {object} an object containing html,css,js from the initial code
 * @function
 */
export const extractCode = code => {
  const styles = trim(
    code.substring(code.indexOf('<style>') + 7, code.indexOf('</style>'))
  );

  const script = trim(
    code.substring(code.indexOf('<script>') + 8, code.indexOf('</script>'))
  );

  const markup = trim(
    code.substring(code.indexOf('<body>') + 6, code.indexOf('<script>'))
  );

  return {
    styles,
    markup,
    script
  };
};

export const syncChain = (...fns) =>
  function chainr(data) {
    return fns.reduce((partial, fn) => fn(partial), data);
  };

export const asyncChain = (...challenges) =>
  function glue(codebase) {
    return challenges.reduce((prevAudit, challenge) => {
      return prevAudit.then(partial => challenge(partial));
    }, Promise.resolve(codebase));
  };

export const toSlug = syncChain(trim, lowercase, spacesToDashs);

export const loadStylesAndScripts = (...urls) => {
  const loadError = oError => {
    throw new URIError(
      `The resource ${oError.target.src} didn't load correctly.`
    );
  };

  const isValidURL = url => url && typeof url === 'string' && url.trim() !== '';

  const js = url =>
    new Promise(resolve => {
      const script = document.createElement('script');
      script.onerror = loadError;
      script.setAttribute('type', 'text/javascript');
      document.body.appendChild(script);
      script.onload = resolve;
      script.src = url;
    });

  const css = url =>
    new Promise(resolve => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.onerror = loadError;
      document.head.appendChild(link);
      link.onload = resolve;
      link.href = url;
    });

  const handleAsset = url => {
    if (url.endsWith('.js')) return js(url);

    if (url.endsWith('.css')) return css(url);

    return Promise.resolve();
  };

  return urls
    .filter(isValidURL)
    .reduce(
      (prevLoadOp, url) => prevLoadOp.then(() => handleAsset(url)),
      Promise.resolve()
    );
};

export const responseCanErr = response => {
  if (!response.ok) throw Error(response.status);
  return response;
};

const dateToUTCTime = (d) => {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()-1, d.getMinutes());
};

export const isAfterKickoffTime = args => {
  const { startingAt } = args;

  const when = dateToUTCTime( new Date(Date.now()) );
  const limit = dateToUTCTime( new Date(`${startingAt}`) );
  
  return when >= limit;
};

export const isWithinDeadline = args => {
  const { endingAt } = args;

  const when = dateToUTCTime( new Date(Date.now()) );
  const limit = dateToUTCTime( new Date(`${endingAt}`) );
  
  return when <= limit;
};

const timeUnits = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24
};

export const dateTimeDiff = (args = {}) => {
  const { from = Date.now(), to = Date.now(), type = "hour" } = args;

  const fromTime = from;
  const toTime = typeof to === "number" ? to : to.getTime();

  let diff = Math.floor(toTime - fromTime) / timeUnits[type];
  return Math.round(diff);
};

const dateTimeDiffRecurse = (args = {}) => {
  const { to = Date.now(), type = "hour" } = args;
  const diff = dateTimeDiff(args);

  if (diff >= 1 || (diff <= 0 && type === "second"))
    return { diff, diffType: type };

  const timeTypeKeys = Object.keys(timeUnits);
  let nextTypePos = timeTypeKeys.indexOf(type) - 1;
  nextTypePos = nextTypePos < 0 ? 0 : nextTypePos;

  return dateTimeDiffRecurse({ to, type: timeTypeKeys[nextTypePos] });
};

export const countDown = (args = {}) => {
  const { type = "hour", callback = noop } = args;

  const run = ({ type: timerType }) => {
    const theArgs = { ...args, ...{ type: timerType } };
    const { diff, diffType } = dateTimeDiffRecurse(theArgs);

    callback({ diff, diffType });

    if (diff <= 0 && diffType === "second") return;

    const nextRun = timeUnits[diffType];
    rAF({ wait: nextRun }).then(() => run({ type: timerType }));
  };
  run({ type });
};
