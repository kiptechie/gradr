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

const codeMirrorAssets = mode => {
  const assets = {
    markdown: [
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/theme/idea.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/mode/markdown/markdown.min.js'
    ],
    htmlmixed: [
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/theme/idea.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/mode/xml/xml.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/mode/javascript/javascript.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/mode/css/css.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/mode/htmlmixed/htmlmixed.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/addon/edit/matchbrackets.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/addon/edit/closebrackets.min.js'
    ]
  };
  return assets[mode] || [];
};

export const loadCodemirrorAssets = ({ mode }) => {
  const modeSpecificAssets = codeMirrorAssets(mode);
  return loadStylesAndScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/codemirror.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.42.2/codemirror.min.js',
    ...modeSpecificAssets
  );
};

export const responseCanErr = response => {
  if (!response.ok) throw Error(response.status);
  return response;
};

export const isAfterKickoffTime = args => {
  const { when = Date.now(), startingAt } = args;
  const limit = new Date(`${startingAt}`);

  limit.setTime(limit.getTime() + limit.getTimezoneOffset() * 60 * 1000);
  return when >= limit.getTime();
};

export const isWithinDeadline = args => {
  const { when = Date.now(), endingAt } = args;
  const limit = new Date(`${endingAt}`);

  limit.setTime(limit.getTime() + limit.getTimezoneOffset() * 60 * 1000);
  return when <= limit.getTime();
};

const timeUnits = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24
};

export const dateTimeDiff = (currentDate, endDate, type = 'day') => {
  const diffType = Object.keys(timeUnits).includes(type) ? type : 'day';
  const unitDiff = timeUnits[diffType];

  const endDateMs =
    typeof endDate === 'object'
      ? endDate.getTime()
      : new Date(endDate).getTime();
  const currentDateMs =
    typeof currentDate === 'object'
      ? currentDate.getTime()
      : new Date(currentDate).getTime();
      
  const diffMs = endDateMs - currentDateMs;

  return Math.round(diffMs / unitDiff);
};

export const countDown = args => {
  
  const run = () => {
    const { from = Date.now(), to, callback = noop, type = 'day' } = args;
    const diff = dateTimeDiff(from, to, type);

    callback(diff);
    rAF({ wait: timeUnits[type] }).then(() => run());
  };
  run();

  // const diffTypes = Object.keys(timeUnits);
  // const nextRun = diffTypes.indexOf(type) === 0 ?
  // const intervalId = setInterval(() => {}, nextRun);
};

// export const recursiveDateTimeDiff = ( currentDate, endDate, type = 'day' ) => {
//   const diff = dateTimeDiff(currentDate, endDate, type);
// };
