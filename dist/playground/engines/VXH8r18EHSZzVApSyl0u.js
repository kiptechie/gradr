const select = document.querySelector.bind(document);
const selectAll = document.querySelectorAll.bind(document);

const computedPropertyStyle = (selectorOrNode, prop) => {
  if (!selectorOrNode) return '';

  const node =
    typeof selectorOrNode === 'string'
      ? select(selectorOrNode)
      : selectorOrNode;

  if (!node) return '';

  return window.getComputedStyle(node).getPropertyValue(prop);
};

const userbeganChallenges = args =>
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

    const mobilised = { ...args, ...{ challengeIndex, completedChallenge } };

    parentWindow.postMessage(
      {
        advancement: {
          index: challengeIndex,
          completed: completedChallenge
        }
      },
      window.location.origin
    );

    resolve(mobilised);
  });

const syncChain = (...fns) =>
  function chainr(data) {
    return fns.reduce((partial, fn) => fn(partial), data);
  };

const asyncChain = (...challenges) =>
  function glue(codebase) {
    return challenges.reduce((prevAudit, challenge) => {
      return prevAudit.then(partial => challenge(partial));
    }, Promise.resolve(codebase));
  };

const challenges = [];

const challengeOne = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const { styles } = payload;

      if (!styles || styles.trim() === '')
        reject(new Error('you have not written any CSS rules'));

      const computedBg = computedPropertyStyle('body', 'background');
      const bgColor = computedBg.substring(
        computedBg.indexOf('('),
        computedBg.indexOf(')') + 1
      );
      if (bgColor !== '(255, 255, 255)')
        reject(
          new Error(
            'you are required to style the body element with a white background'
          )
        );

      resolve(payload);
    });
  },

  stepTwo(payload) {
    return new Promise((resolve, reject) => {
      const selectWrap = select('.select-currency.select');
      if (!selectWrap) {
        reject(
          new Error(
            'you are required to create a DIV with class "select-currency" and "select"'
          )
        );
      }
      resolve(payload);
    });
  },

  stepThree(payload) {
    return new Promise((resolve, reject) => {
      const selectEl = select('.select-currency.select select.select-text');
      if (!selectEl) {
        reject(
          new Error(
            'you are required to create a SELECT element inside the DIV with class "select-currency"'
          )
        );
      }

      const choosr = selectEl.querySelector('option[disabled][selected]');
      if (!choosr || choosr.hasAttribute('value')) {
        reject(
          new Error(
            'your SELECT element needs to have an OPTION that has no value attribute, is selected by default, and disabled'
          )
        );
      }

      if (choosr.textContent.trim() === '') {
        reject(
          new Error(
            'your currency chooser OPTION needs to have a call to action text'
          )
        );
      }

      resolve(payload);
    });
  },

  stepFour(payload) {
    return new Promise((resolve, reject) => {
      const btn = select('button.btn');
      if (!btn) {
        reject(
          new Error(
            'you are required to create a BUTTON with class "btn" that will be cliked to make conversion'
          )
        );
      }
      resolve(payload);
    });
  },

  stepFive(payload) {
    return new Promise((resolve, reject) => {
      const display = select('.conversion.mdc-elevation--z3');
      if (!display) {
        reject(
          new Error(
            'you are required to create a DIV with a class of "conversion" and "mdc-elevation--z3"'
          )
        );
      }
      resolve(payload);
    });
  },

  stepSix(payload) {
    return new Promise((resolve, reject) => {
      const toast = select('.messages');
      if (!toast) {
        reject(
          new Error(
            'you are required to create a DIV with a class of "messages". It will be used to display important messages as the app runs'
          )
        );
      }
      resolve(payload);
    });
  }
};
challenges.push(challengeOne);

const challengeTwo = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const bodyMargin = computedPropertyStyle('body', 'margin');
      if (bodyMargin !== '15px') {
        reject(new Error('the BODY element should have a 15 pixels margin'));
      }

      const selectWrapMargin = computedPropertyStyle('.select', 'margin-top');
      if (selectWrapMargin !== '50px') {
        reject(
          new Error(
            `the DIV with the 'select' class should have a 50 pixels top margin`
          )
        );
      }

      const conversionMargin = computedPropertyStyle(
        '.conversion.mdc-elevation--z3',
        'margin'
      );
      if (conversionMargin !== '25px 0px') {
        reject(
          new Error(
            `the DIV with the 'conversion' class should have a top and bottom margin of 25 pixels, while its left and right margins should be zero`
          )
        );
      }

      resolve(payload);
    });
  },

  stepTwo(payload) {
    return new Promise((resolve, reject) => {
      const btnText = select('button.btn').textContent;
      const btnWidth = computedPropertyStyle('button.btn', 'width');
      if (btnWidth < 200)
        reject(new Error(`the "${btnText}" BUTTON should be wider!`));

      let btnPadding = computedPropertyStyle('button.btn', 'padding');
      btnPadding = parseInt(btnPadding.replace('px', ''), 10);
      if (btnPadding < 8)
        reject(new Error(`the "${btnText}" BUTTON has too little padding!`));

      resolve(payload);
    });
  },

  stepThree(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const ast = esprima.parseScript(script);

      let fnCalled = false;
      let fnDeclared = false;
      // 1. is there a populateCurrencies arrow function declaration
      estraverse.traverse(ast, {
        enter: function(node, parent) {
          if (
            node.type === 'VariableDeclarator' &&
            node.id &&
            node.id.type === 'Identifier' &&
            node.id.name === 'populateCurrencies' &&
            node.init &&
            node.init.type === 'ArrowFunctionExpression'
          ) {
            fnDeclared = true;
          }
        }
      });

      // 2. is it called
      estraverse.traverse(ast, {
        enter: function(node, parent) {
          if (
            node.type === 'CallExpression' &&
            node.callee.type === 'Identifier' &&
            node.callee.name === 'populateCurrencies'
          ) {
            fnCalled = true;
          }
        }
      });

      // 3. if we obtain the values of the SELECT options, will it
      // give us the keys of the objects in the currencies array
      const selectEl = select('select.select-text');
      const existingOpts = selectEl.querySelectorAll('option');
      selectEl.innerHTML = `<option selected disabled></option>`;
      populateCurrencies();
      const actualOpts = Array.from(selectEl.querySelectorAll('option[value]'));
      selectEl.innerHTML = '';
      for (let opt of existingOpts) {
        selectEl.appendChild(opt);
      }

      if (fnDeclared && fnCalled && actualOpts.length === currencies.length) {
        const actuals = actualOpts.map(o => o.value).join('');
        const target = currencies.map(c => c.id).join('');
        if (actuals === target) {
          return resolve(payload);
        }
      }

      reject(
        new Error(
          `follow the instructions on how to implement and call the 'populateCurrencies' function`
        )
      );
    });
  },

  stepFour(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const ast = esprima.parseScript(script);

      const convertIsPointFreeCall = (node, parent) =>
        node.type === 'Identifier' &&
        node.name === 'convert' &&
        parent.type === 'CallExpression' &&
        parent.callee.type === 'MemberExpression' &&
        parent.callee.property.type === 'Identifier' &&
        parent.callee.property.name === 'addEventListener';

      const convertIsInvocationCall = (node, parent) =>
        node.type === 'CallExpression' &&
        node.callee.name === 'convert' &&
        node.arguments[0] &&
        node.arguments[0].type === 'Identifier';

      // 1. is there a call to the convert function
      // and is it given a parameter
      estraverse.traverse(ast, {
        enter: function(node, parent) {
          if (
            convertIsPointFreeCall(node, parent) ||
            convertIsInvocationCall(node, parent)
          ) {
            resolve(payload);
          }
        }
      });

      reject(
        new Error(
          `follow the instructions and setup a click listener on the BUTTON. the listener should call the 'convert' function and pass it the click event`
        )
      );

      resolve(payload);
    });
  },

  stepFive(payload) {
    return new Promise((resolve, reject) => {
      // 1. is there a getSelectedCurrency declaration
      // 2. when called, does it return the selected currency
      const selectEl = select('select.select-text');
      const option =
        currencies[Math.floor(Math.random() * currencies.length)] ||
        currencies[0];
      selectEl.value = option.id;
      const selected = getSelectedCurrency();
      if (!selected || selected !== option.id)
        reject(
          new Error(
            `your 'getSelectedCurrency' function isn't returning the selected currency`
          )
        );

      resolve(payload);
    });
  }
};
challenges.push(challengeTwo);

const challengeThree = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const ast = esprima.parseScript(script);

      let hasFetchCallFlag = false;
      let hasConvertToJsonCallFlag = false;
      let hasConversionInvocationFlag = false;
      let hasPointFreeConversionInvocationFlag = false;

      const hasPointFreeConversionInvocation = node => {
        if (hasPointFreeConversionInvocationFlag) return node;

        if (
          node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Identifier' &&
          node.arguments[0].name === 'conversionSucceeded'
        ) {
          hasPointFreeConversionInvocationFlag = true;
        }
        return node;
      };

      const hasConversionInvocation = node => {
        if (hasConversionInvocationFlag) return node;

        if (
          node.type === 'CallExpression' &&
          node.callee.type === 'Identifier' &&
          node.callee.name === 'conversionSucceeded' &&
          node.arguments[0] &&
          node.arguments[0].type === 'Identifier'
        ) {
          hasConversionInvocationFlag = true;
        }
        return node;
      };

      const hasConvertToJsonCall = node => {
        if (hasConvertToJsonCallFlag) return node;

        if (
          node.type === 'MemberExpression' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'json'
        ) {
          hasConvertToJsonCallFlag = true;
        }
        return node;
      };

      const hasFetchCall = node => {
        if (hasFetchCallFlag) return node;

        if (
          node.type === 'CallExpression' &&
          node.callee.type === 'Identifier' &&
          node.callee.name === 'fetch' &&
          node.arguments[0] &&
          (node.arguments[0].type === 'Identifier' &&
            node.arguments[0].name === 'endpoint')
        ) {
          hasFetchCallFlag = true;
        }
        return node;
      };

      const chain = syncChain(
        hasFetchCall,
        hasConvertToJsonCall,
        hasConversionInvocation,
        hasPointFreeConversionInvocation
      );

      estraverse.traverse(ast, {
        enter: function(node) {
          chain(node);
        }
      });

      if (
        hasFetchCallFlag &&
        hasConvertToJsonCallFlag &&
        (hasConversionInvocationFlag || hasPointFreeConversionInvocationFlag)
      ) {
        resolve(payload);
      }

      reject(
        new Error(
          `Within the 'convert' function, make a fetch call to the URL declared as the 'endpoint' variable. Convert the response to JSON, then call 'conversionSucceeded' and pass the JSON data to it`
        )
      );
    });
  }
};
challenges.push(challengeThree);

const pingPong = data => Promise.resolve(data);
const audits = challenges.reduce((pool, challenge, index) => {
  let steps = Object.values(challenge);
  let start = index === 0 ? userbeganChallenges : pingPong;
  return [...pool, asyncChain(start, ...steps, userCompletedThisChallenge)];
}, []);

const gradr = asyncChain(...audits);