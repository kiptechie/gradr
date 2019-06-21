const noop = () => {};

const select = document.querySelector.bind(document);
const selectAll = document.querySelectorAll.bind(document);

const trim = (raw = '') => `${raw}`.trim();
const includes = (substring = '') => (content = '') =>
  `${content}`.includes(`${substring}`);
const doesNotInclude = (substring = '') => (content = '') =>
  !`${content}`.includes(`${substring}`);
const endsWith = (substring = '') => (content = '') =>
  `${content}`.endsWith(`${substring}`);
const doesNotEndWith = (substring = '') => (content = '') =>
  !`${content}`.endsWith(`${substring}`);
const startsWith = (substring = '') => (content = '') =>
  `${content}`.startsWith(`${substring}`);
const doesNotStartWith = (substring = '') => (content = '') =>
  !`${content}`.startsWith(`${substring}`);

const pingPong = data => Promise.resolve(data);

/* 2
evaluate effective properties (computed style) of UI elements
================================================================ */
const css = (selectorOrNode, prop) => {
  if (!selectorOrNode) return '';

  const node =
    typeof selectorOrNode === 'string'
      ? select(selectorOrNode)
      : selectorOrNode;

  if (!node) return '';

  return window.getComputedStyle(node).getPropertyValue(prop);
};

const box = (...calls) => {
  let api = {};
  for (call of calls) {
    api = { ...api, ...{ [call.name]: call } };
  }
  return api;
};

const isEqual = expected => actual => actual === expected;
const isNotEqual = expected => actual => actual !== expected;
const isOrOver = expected => actual => actual >= expected;
const isOrUnder = expected => actual => actual <= expected;

const asIs = value => value;
const asHex = rgb => {
  const hex = rgb
    .replace(/[rgba?()]/g, '')
    .split(/\s*,\s*/)
    .map(int => {
      const hex = parseInt(int).toString(16);
      return hex.length == 1 ? `0${hex}` : hex;
    })
    .join('');

  return `#${hex}`;
};

const asPixelsToInt = value => parseInt(value, 10);
const asPixelsToFloat = value => parseFloat(value, 10);

const on = nodeOrSelector => {
  const results = [];
  const tellMe = () => results.includes(true);

  const ifThe = (prop, transform, check) => {
    const actual = transform(css(nodeOrSelector, prop));
    // console.log(`${prop} on ${nodeOrSelector} => ${actual} : ${check(actual)}`);
    results.push(check(actual));
    return box(ifThe, tellMe);
  };

  return box(ifThe);
};

const chain = (...tasks) => async data => {
  return await tasks.reduce(async (prevTask, fn) => {
    const baton = await prevTask;
    return fn(baton);
  }, Promise.resolve(data));
};

const haltAuditWith = reject => msg => {
  reject(new Error(msg));
};

const deferAuditHaltWith = reject => msg => () => {
  reject(new Error(msg));
};

const createAudit = (queryFn, queryArgs) => async ({ ast, astq }) => {
  try {
    const query = queryFn(queryArgs);
    const [node] = astq.query(ast, query);
    return node !== undefined;
  } catch (queryError) {}
};

const audit = fn => {
  const auditor = haltWithFeedback => {
    return async ({ ast, astq }) => {
      const status = await fn({ ast, astq });
      if (status !== true) haltWithFeedback();
      return { ast, astq };
    };
  };

  return {
    and: feedbackFn => auditor(feedbackFn)
  };
};

const auditJavascript = async (js, assert) => {
  const astq = new ASTQ();
  astq.adapter('mozast');

  const ast = esprima.parseScript(js);
  return await assert({ ast, astq });
};

const queryLiteralDeclaration = ({ kind = 'const', name, value }) => {
  const valuePartial = `&& /:init Literal [@value == '${value}']`;
  const query = `
    //VariableDeclaration [
      @kind == '${kind}' &&
      /:declarations VariableDeclarator [
        /:id Identifier [@name == '${name}'] 
        ${value ? valuePartial : ''}
      ]
    ]
  `;
  return query;
};

const queryNamedArrowFnHasCalls = ({ name, kind = 'const', calls = [] }) => {
  const callsSubQuery = calls.reduce((lastCall, call, index) => {
    let prefix = index === 0 ? '' : `${lastCall} &&`;
    return `${prefix} //CallExpression /:callee Identifier [@name == '${call}'] `;
  }, '');

  const query = `
    //VariableDeclaration [
      @kind == '${kind}' &&
      /:declarations VariableDeclarator [
        /:id Identifier [@name == '${name}'] 
        && /:init ArrowFunctionExpression [
          ${callsSubQuery}
        ]
      ]
    ]
  `;
  return query;
};

const queryNamedArrowFnHasParams = ({name, kind = 'const', params = []}) => {
  const paramsSubQuery = params.reduce((prevQuery, param, index) => {
    const prefix = index === 0 ? '' : `${prevQuery} &&`;
    let qry = `${prefix} /:params`;
    if(typeof param === 'string' || param.type === 'Identifier') {
      qry = `${qry} Identifier [@name == '${param.name || param}']`;
    } else if (param.type === 'AssignmentPattern') {
      qry = `${qry} AssignmentPattern [
        /:left ${param.left.type} [@name == '${param.left.name}']
        && /:right ${param.right.type}
      ]`;
    } else if (param.type === 'ArrayPattern') {
      qry = `${qry} ArrayPattern [
      	// Identifier [@name == '${param.name}']
      ]`;
    } else if (param.type === 'ObjectPattern') {
      qry = `${qry} ObjectPattern [
      	/Property /Identifier [@name == '${param.name}']
      ]`;
    }else {
      qry = prevQuery;
    }

    return qry;
  }, '');

  // let x = [{
  //   type: 'Identifier', name: 'figure'
  // }, {
  //   type: AssignmentPattern, 
  //   left: {type: 'Identifier', name: 'options'},
  //   right: {type: 'ArrayExpression'}
  // }];

  const query = `
    //VariableDeclaration [
      @kind == '${kind}' &&
      /:declarations VariableDeclarator [
        /:id Identifier [@name == '${name}'] 
        && /:init ArrowFunctionExpression [
            ${paramsSubQuery}
          ]
       ]
    ]
  `;

  return query;
};

const queryNamedArrowFnHasOnlySimpleParams = ({name, kind = 'const', params = []}) => {
  const paramsSubQuery = params.reduce((prevQuery, param, index) => {
    const prefix = index === 0 ? '' : `${prevQuery} &&`;
    const query = `${prefix} /:params `;
    


    return query;
  }, '');

  const query = `
    //VariableDeclaration [
      @kind == '${kind}' &&
      /:declarations VariableDeclarator [
        /:id Identifier [@name == '${name}'] 
        && /:init ArrowFunctionExpression [
          ${paramsSubQuery}
        ]
      ]
    ]
  `;

  return query;
}

// TODO wrap the event calls under
// /: arguments
const queryNamedArrowFnAddsEventsListener = ({
  name,
  kind = 'const',
  events = []
}) => {
  const eventsSubQuery = events.reduce((lastEvt, { type, handler }) => {
    return `${lastEvt} && // Literal [@value == '${type}'] && // Identifier [@name == '${handler}']`;
  }, '');

  const query = `
   //VariableDeclaration [
      @kind == '${kind}' &&
      /:declarations VariableDeclarator [
        /:id Identifier [@name == '${name}'] 
        && /:init ArrowFunctionExpression [
          //CallExpression 
            /:callee MemberExpression [
              /:property Identifier [@name == 'addEventListener']
           ]
           ${eventsSubQuery}
        ]
      ]
    ]
  `;
  return query;
};

const queryExpressionDeclaration = ({ kind = 'const', name, exprType }) => {
  const query = `
    //VariableDeclaration [
      @kind == '${kind}' &&
      /:declarations VariableDeclarator [
        /:id Identifier [@name == '${name}'] 
        && /:init ${exprType}
      ]
    ]
  `;
  return query;
};

const queryArrowFunction = ({ kind = 'const', name }) => {
  return queryExpressionDeclaration({
    kind,
    name,
    exprType: 'ArrowFunctionExpression'
  });
};

/*const isDeclaration = ({ node, kind = 'const', name, init }) => {
  const left =
    node &&
    node.type === 'VariableDeclaration' &&
    node.kind === kind &&
    node.declarations &&
    node.declarations[0] &&
    node.declarations[0].type === 'VariableDeclarator' &&
    node.declarations[0].id &&
    node.declarations[0].id.type === 'Identifier' &&
    node.declarations[0].id.name === name;

  if (!init) return left;

  const right =
    node.declarations &&
    node.declarations[0] &&
    node.declarations[0].init &&
    node.declarations[0].init.type === init;

  return left && right;
};*/

const userBeganChallenges = args =>
  new Promise(resolve => {
    const challengeIndex = 0;
    const completedChallenge = -1;
    const start = { ...args, ...{ challengeIndex, completedChallenge } };
    resolve(start);
  });

const userCompletedThisChallenge = args =>
  new Promise(resolve => {
    let { challengeIndex, completedChallenge } = args;
    completedChallenge = challengeIndex;
    challengeIndex += 1;

    const payload = { ...args, ...{ challengeIndex, completedChallenge } };

    parentWindow.postMessage(
      {
        advancement: {
          index: challengeIndex,
          completed: completedChallenge
        }
      },
      window.location.origin
    );

    resolve(payload);
  });

const asyncChain = (...challenges) =>
  function glue (codebase) {
    return challenges.reduce((prevAudit, challenge) => {
      return prevAudit.then(partial => challenge(partial));
    }, Promise.resolve(codebase));
  };