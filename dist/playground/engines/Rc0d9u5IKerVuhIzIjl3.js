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

const apiDone = data => {
  document.addEventListener(
    'api-audit-ready',
    () => {
      document.dispatchEvent(new CustomEvent('api-done', { detail: data }));
    },
    { once: true }
  );
  document.dispatchEvent(new CustomEvent('api-done-installed'));
};

const gradrInstrumentation = program => {
  const nodeIsDisplayUserPhotoAndNameFn = node => {
    return (
      node &&
      node.type === 'VariableDeclarator' &&
      node.id.type === 'Identifier' &&
      node.id.name === 'displayUserPhotoAndName' &&
      node.init.type === 'ArrowFunctionExpression' &&
      node.init.params &&
      node.init.params[0] &&
      node.init.params[0].type === 'Identifier' &&
      node.init.params[0].name === 'data'
    );
  };

  const padDisplayUserPhotoAndNameFn = node => {
    if (nodeIsDisplayUserPhotoAndNameFn(node)) {
      if (node.init && node.init.body && node.init.body.body) {
        const body = node.init.body.body;
        const ast = esprima.parseScript(`apiDone(data)`);
        body.push(ast.body[0]);
      }
    }
    return node;
  };

  const instrumentationChain = syncChain(padDisplayUserPhotoAndNameFn);

  estraverse.traverse(program, {
    enter: function(node) {
      instrumentationChain(node);
    }
  });

  return program;
};

const challengeOne = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const heading = select('h2');
      if (!heading)
        reject(new Error(`you have not created a HEADING for the user's name`));

      const photoWrap = select('.user-photo.mdc-elevation--z3');
      if (!photoWrap)
        reject(
          new Error(
            `you have not created a DIV with a class of 'user-photo' and 'mdc-elevation--z3' as specified`
          )
        );

      const photoImg = photoWrap.querySelector('img');
      if (!photoImg)
        reject(
          new Error(`you have not created an IMG within the user-photo DIV`)
        );

      const src = photoImg.src || '';
      if (src.indexOf('via.placeholder.com') < 0)
        reject(
          new Error(`your IMG does not have a placeholder from placeholder.com`)
        );

      resolve(payload);
    });
  },

  stepTwo(payload) {
    return new Promise((resolve, reject) => {
      const details = select('.details.mdc-elevation--z3');
      if (!details)
        reject(
          new Error(
            `you have not created a DIV with a class of 'details' and 'mdc-elevation--z3' as specified`
          )
        );

      const msgs = select('.messages');
      if (!msgs)
        reject(
          new Error(
            `you have not created a DIV with class of 'messages' as specified. It will be used to display important messages as your app runs`
          )
        );

      resolve(payload);
    });
  },

  stepThree(payload) {
    return new Promise((resolve, reject) => {
      const footer = select('footer');
      if (!footer)
        reject(new Error(`you have not created a FOOTER for the UI`));

      const footerBtns = footer.querySelectorAll(
        'button.mdc-icon-button.material-icons'
      );
      if (!footerBtns || [...footerBtns].length !== 3) {
        reject(
          new Error(
            `you have not created the specified number of FOOTER buttons`
          )
        );
      }

      const invalidBtn = [
        select('#btn-birthdate.mdc-icon-button.material-icons'),
        select('#btn-phone.mdc-icon-button.material-icons'),
        select('#btn-address.mdc-icon-button.material-icons')
      ].find(el => el === null || el === undefined);

      if(invalidBtn) {
        reject(
          new Error(
            `your FOOTER buttons do not have the specified DOM attributes`
          )
        );
      }

      const noIconBtn = [...footerBtns].find(
        btn => !btn.textContent || btn.textContent.trim() === ''
      );
      if (noIconBtn)
        reject(new Error(`your FOOTER buttons do not all have icons`));

      resolve(payload);
    });
  }
};
challenges.push(challengeOne);

const challengeTwo = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const bodyMargin = computedPropertyStyle('body', 'margin');
      if (bodyMargin !== '0px')
        reject(new Error('the BODY element should have no margins'));

      const bodyOverflow = computedPropertyStyle('body', 'overflow');
      if (bodyOverflow !== 'hidden')
        reject(new Error('the BODY element should not allow scrolling'));

      const headingAlign = computedPropertyStyle('h2', 'text-align');
      if (headingAlign !== 'center')
        reject(new Error('the HEADING element does not center its text'));

      let headingMarginBottom = computedPropertyStyle(
        'h2',
        'margin-bottom'
      ).replace('px', '');
      let headingMarginBottomVal = parseInt(
        headingMarginBottom === '' ? 0 : headingMarginBottom
      );
      if (headingMarginBottomVal < 65)
        reject(
          new Error(`the HEADING element doesn't have enough bottom space`)
        );
      if (headingMarginBottom > 85)
        reject(new Error(`the HEADING element too much bottom space!`));

      resolve(payload);
    });
  },

  stepTwo(payload) {
    return new Promise((resolve, reject) => {
      const detailsBG = computedPropertyStyle('.details', 'background-color');
      const bgColorValue = detailsBG.substring(
        detailsBG.indexOf('('),
        detailsBG.indexOf(')') + 1
      );

      if (bgColorValue !== '(98, 0, 238)') {
        reject(
          new Error(
            `you are required to style the '.details' DIV with the right background color`
          )
        );
      }

      const detailsHeight = computedPropertyStyle(
        '.details',
        'min-height'
      ).replace('px', '');
      const detailsHeightVal = parseInt(
        detailsHeight === '' ? 0 : detailsHeight
      );
      if (detailsHeightVal < 220) {
        reject(
          new Error(
            `you are required to style the '.details' DIV with the required minimum height`
          )
        );
      }

      // let dobBtnColor = computedPropertyStyle('#btn-birthdate', 'color');
      // let phoneBtnColor = computedPropertyStyle('#btn-phone', 'color');
      // let addressBtnColor = computedPropertyStyle('#btn-address', 'color');

      // const btnColors = [dobBtnColor, phoneBtnColor, addressBtnColor]
      //   .map(color => {
      //     return color.substring(color.indexOf('('), color.indexOf(')') + 1);
      //   })
      //   .join(' ');

      // if (btnColors !== '(255, 255, 255) (255, 255, 255) (255, 255, 255)') {
      //   reject(new Error(`your FOOTER buttons do not all have a white color`));
      // }

      resolve(payload);
    });
  },

  stepThree(payload) {
    return new Promise((resolve, reject) => {
      const photoWrapBRadius = computedPropertyStyle(
        'div.user-photo',
        'border-radius'
      );
      const photoWrapOverflow = computedPropertyStyle(
        'div.user-photo',
        'overflow'
      );

      if (photoWrapBRadius !== '50%') {
        reject(
          new Error(
            `your user photo IMG wrapper is not rendered as a circle, yet!`
          )
        );
      }

      if (photoWrapOverflow !== 'hidden') {
        reject(
          new Error(
            `your user photo wrapper is not clipping the IMG if the IMG overflows it bounds`
          )
        );
      }

      const photoDisplay = computedPropertyStyle(
        'div.user-photo img',
        'display'
      );

      if (photoDisplay !== 'block') {
        reject(
          new Error(`your user photo IMG is not fully occupying its container`)
        );
      }

      resolve(payload);
    });
  }
};
challenges.push(challengeTwo);

const challengeThree = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const fnStatus = (node, fnName) =>
        node &&
        node.type === 'VariableDeclarator' &&
        node.id.type === 'Identifier' &&
        node.id.name === fnName &&
        node.init.type === 'ArrowFunctionExpression';

      const hasDisplayPhoneFn = ({ audits, node }) => {
        const fnName = hasDisplayPhoneFn.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (fnStatus(node, 'displayPhone')) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const hasDisplayBirthdateFn = ({ audits, node }) => {
        const fnName = hasDisplayBirthdateFn.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (fnStatus(node, 'displayBirthdate')) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const hasDisplayAddressFn = ({ audits, node }) => {
        const fnName = hasDisplayAddressFn.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (fnStatus(node, 'displayAddress')) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const auditChain = syncChain(
        hasDisplayBirthdateFn,
        hasDisplayAddressFn,
        hasDisplayPhoneFn
      );

      const audits = {};
      const { script } = payload;
      const ast = esprima.parseScript(script);
      estraverse.traverse(ast, {
        enter: function(node) {
          auditChain({ audits, node });
        }
      });

      if (Object.values(audits).includes(false)) {
        reject(
          new Error(
            `You have not declared displayBirthdate, displayPhone, and displayAddress as required!`
          )
        );
      }

      resolve(payload);
    });
  },

  stepTwo(payload) {
    return new Promise((resolve, reject) => {
      const nodeIsDisplayExtraUserInfoFn = node => {
        return (
          node &&
          node.type === 'VariableDeclarator' &&
          node.id.type === 'Identifier' &&
          node.id.name === 'displayExtraUserInfo' &&
          node.init.type === 'ArrowFunctionExpression' &&
          node.init.params &&
          node.init.params[0] &&
          node.init.params[0].type === 'Identifier' &&
          node.init.params[0].name
        );
      };

      const findListener = (node, fnName) => {
        return (
          node &&
          node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'addEventListener' &&
          node.arguments &&
          node.arguments[1] &&
          node.arguments[1].type === 'ArrowFunctionExpression' &&
          ((node.arguments[1].body.type === 'CallExpression' &&
            node.arguments[1].body.callee.name === fnName &&
            node.arguments[1].body.arguments &&
            node.arguments[1].body.arguments[0] &&
            node.arguments[1].body.arguments[0].name) ||
            (node.arguments[1].body &&
              node.arguments[1].body.type === 'BlockStatement' &&
              node.arguments[1].body.body &&
              node.arguments[1].body.body[0] &&
              node.arguments[1].body.body[0].expression &&
              node.arguments[1].body.body[0].expression.type ===
                'CallExpression' &&
              node.arguments[1].body.body[0].expression.callee.name ===
                fnName &&
              node.arguments[1].body.body[0].expression.arguments &&
              node.arguments[1].body.body[0].expression.arguments[0] &&
              node.arguments[1].body.body[0].expression.arguments[0].name))
        );
      };

      const hasListener = (node, listenerFnName) => {
        if (nodeIsDisplayExtraUserInfoFn(node)) {
          const body = node.init.body.body;
          const expressions = body.map(statement => {
            if (statement.type === 'ExpressionStatement') {
              return statement.expression;
            }
          });

          return expressions
            .filter(expr => expr !== undefined)
            .find(expr => findListener(expr, listenerFnName));
        }
        return false;
      };

      const hasBirthdateBtnListener = ({ audits, node }) => {
        const fnName = hasBirthdateBtnListener.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (hasListener(node, 'displayBirthdate')) {
          audits[fnName] = true;
        }

        return { audits, node };
      };

      const hasPhoneBtnListener = ({ audits, node }) => {
        const fnName = hasPhoneBtnListener.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (hasListener(node, 'displayPhone')) {
          audits[fnName] = true;
        }

        return { audits, node };
      };

      const hasAddressBtnListener = ({ audits, node }) => {
        const fnName = hasAddressBtnListener.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (hasListener(node, 'displayAddress')) {
          audits[fnName] = true;
        }

        return { audits, node };
      };

      const hasDisplayExtraUserInfoFn = ({ audits, node }) => {
        const fnName = hasDisplayExtraUserInfoFn.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (nodeIsDisplayExtraUserInfoFn(node)) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const auditChain = syncChain(
        hasDisplayExtraUserInfoFn,
        hasBirthdateBtnListener,
        hasPhoneBtnListener,
        hasAddressBtnListener
      );

      const audits = {};
      const { script } = payload;
      const ast = esprima.parseScript(script);
      estraverse.traverse(ast, {
        enter: function(node, parent) {
          auditChain({ audits, node, parent });
        }
      });

      if (!audits[hasDisplayExtraUserInfoFn.name]) {
        reject(
          new Error(
            `You have not declared a displayExtraUserInfo function as specified!`
          )
        );
      }

      if (!audits[hasBirthdateBtnListener.name]) {
        reject(
          new Error(
            `You have not created a click listener for the 'btn-birthdate' button as specified`
          )
        );
      }

      if (!audits[hasPhoneBtnListener.name]) {
        reject(
          new Error(
            `You have not created a click listener for the 'btn-phone' button as specified`
          )
        );
      }

      if (!audits[hasAddressBtnListener.name]) {
        reject(
          new Error(
            `You have not created a click listener for the 'btn-address' button as specified`
          )
        );
      }

      resolve(payload);
    });
  },

  stepThree(payload) {
    return new Promise((resolve, reject) => {
      const fnStatus = (node, fnName, ...params) =>
        node &&
        node.type === 'VariableDeclarator' &&
        node.id.type === 'Identifier' &&
        node.id.name === fnName &&
        node.init.type === 'ArrowFunctionExpression' &&
        node.init.params &&
        node.init.params[0] &&
        node.init.params[0].type === 'ObjectPattern' &&
        node.init.params[0].properties &&
        params.every((p, i) => {
          return (
            node.init.params[0].properties[i] &&
            node.init.params[0].properties[i].key.type === 'Identifier' &&
            node.init.params[0].properties[i].key.name === p
          );
        });

      const hasModifiedBirthdateFn = ({ audits, node }) => {
        const fnName = hasModifiedBirthdateFn.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (fnStatus(node, 'displayBirthdate', 'dob')) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const hasModifiedAddressFn = ({ audits, node }) => {
        const fnName = hasModifiedAddressFn.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (fnStatus(node, 'displayAddress', 'location')) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const hasModifiedPhoneFn = ({ audits, node }) => {
        const fnName = hasModifiedPhoneFn.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (fnStatus(node, 'displayPhone', 'phone', 'cell')) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const auditChain = syncChain(
        hasModifiedBirthdateFn,
        hasModifiedAddressFn,
        hasModifiedPhoneFn
      );

      const audits = {};
      const { script } = payload;
      const ast = esprima.parseScript(script);
      estraverse.traverse(ast, {
        enter: function(node) {
          auditChain({ audits, node });
        }
      });

      if (!audits[hasModifiedBirthdateFn.name]) {
        reject(
          new Error(
            `You have not modified your displayBirthdate function to use de-structured parameters, as spefified!`
          )
        );
      }

      if (!audits[hasModifiedAddressFn.name]) {
        reject(
          new Error(
            `You have not modified your displayAddress function to use de-structured parameters, as spefified!`
          )
        );
      }

      if (!audits[hasModifiedPhoneFn.name]) {
        reject(
          new Error(
            `You have not modified your displayPhone function to use de-structured parameters, as spefified!`
          )
        );
      }

      resolve(payload);
    });
  }
};
challenges.push(challengeThree);

const challengeFour = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const nodeIsStartAppFn = node => {
        return (
          node &&
          node.type === 'VariableDeclarator' &&
          node.id.type === 'Identifier' &&
          node.id.name === 'startApp' &&
          node.init.type === 'ArrowFunctionExpression'
        );
      };

      const findGetAUserProfileCall = node => {
        return (
          node &&
          node.type === 'CallExpression' &&
          node.callee.name === 'getAUserProfile'
        );
      };

      const hasGetAUserProfileCall = ({ audits, node }) => {
        const fnName = hasGetAUserProfileCall.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (nodeIsStartAppFn(node)) {
          const body = node.init.body.body;
          const expressions = body.map(statement => {
            if (statement.type === 'ExpressionStatement') {
              return statement.expression;
            }
          });

          const stmnt = expressions
            .filter(expr => expr !== undefined)
            .find(findGetAUserProfileCall);

          if (stmnt) {
            audits[fnName] = true;
          }
        }

        return { audits, node };
      };

      const auditChain = syncChain(hasGetAUserProfileCall);

      const audits = {};
      const { script } = payload;
      const ast = esprima.parseScript(script);
      estraverse.traverse(ast, {
        enter: function(node) {
          auditChain({ audits, node });
        }
      });

      if (!audits[hasGetAUserProfileCall.name]) {
        reject(
          new Error(
            `You need to call getAUserProfile from within the startApp function`
          )
        );
      }

      resolve(payload);
    });
  },

  stepTwo(payload) {
    return new Promise((resolve, reject) => {
      const nodeIsDisplayUserPhotoAndNameFn = node => {
        return (
          node &&
          node.type === 'VariableDeclarator' &&
          node.id.type === 'Identifier' &&
          node.id.name === 'displayUserPhotoAndName' &&
          node.init.type === 'ArrowFunctionExpression' &&
          node.init.params &&
          node.init.params[0] &&
          node.init.params[0].type === 'Identifier' &&
          node.init.params[0].name === 'data'
        );
      };

      const findDestructuredStatement = (node, left, right) => {
        return (
          (node &&
            node.type === 'VariableDeclarator' &&
            node.init &&
            node.init.type === 'Identifier' &&
            node.init.name === right &&
            node.id &&
            (node.id.type === 'ObjectPattern' &&
              node.id.properties &&
              node.id.properties[0] &&
              node.id.properties[0].type === 'Property' &&
              node.id.properties[0].key.name === left &&
              node.id.properties[0].value.name === left)) ||
          (node.id.type === 'ArrayPattern' &&
            node.id.elements &&
            node.id.elements[0] &&
            node.id.elements[0].type === 'Identifier' &&
            node.id.elements[0].name === left)
        );
      };

      const hasDestructuredStatement = (node, left, right) => {
        if (nodeIsDisplayUserPhotoAndNameFn(node)) {
          const body = node.init.body.body;
          const expressions = body.map(statement => {
            if (
              statement.type === 'VariableDeclaration' &&
              statement.declarations
            ) {
              return statement.declarations[0];
            }
          });

          return expressions
            .filter(expr => expr !== undefined)
            .find(expr => {
              return findDestructuredStatement(expr, left, right);
            });
        }
        return false;
      };

      const hasDisplayUserPhotoAndNameFn = ({ audits, node }) => {
        const fnName = hasDisplayUserPhotoAndNameFn.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (nodeIsDisplayUserPhotoAndNameFn(node)) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const hasResultsDestructuring = ({ audits, node }) => {
        const fnName = hasResultsDestructuring.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (hasDestructuredStatement(node, 'results', 'data')) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const hasProfileDestructuring = ({ audits, node }) => {
        const fnName = hasProfileDestructuring.name;
        if (audits[fnName]) return { audits, node };

        audits[fnName] = false;
        if (hasDestructuredStatement(node, 'profile', 'results')) {
          audits[fnName] = true;
        }
        return { audits, node };
      };

      const auditChain = syncChain(
        hasDisplayUserPhotoAndNameFn,
        hasResultsDestructuring,
        hasProfileDestructuring
      );

      const audits = {};
      const { script } = payload;
      const ast = esprima.parseScript(script);
      estraverse.traverse(ast, {
        enter: function(node, parent) {
          auditChain({ audits, node, parent });
        }
      });

      if (!audits[hasDisplayUserPhotoAndNameFn.name]) {
        reject(
          new Error(
            `Your displayUserPhotoAndName function declaration has either been wrongly altered or might not be getting the correct data from your API call.`
          )
        );
      }

      if (!audits[hasResultsDestructuring.name]) {
        reject(
          new Error(
            `You have not de-structured the 'results' property from the 'data' parameter passed to 'displayUserPhotoAndName' function`
          )
        );
      }

      if (!audits[hasProfileDestructuring.name]) {
        reject(
          new Error(
            `You have not de-structured the 'profile' property from 'results' obtained from 'data' passed to 'displayUserPhotoAndName' function`
          )
        );
      }

      resolve(payload);
    });
  },

  stepThree(payload) {
    return new Promise((resolve, reject) => {
      const setsProfileName = profile => {
        const { title, last, first } = profile.name;
        const expected = `${title} ${last} ${first}`;
        const actual = select('h2').textContent;

        if (expected !== actual) {
          reject(
            new Error(
              `You are not properly displaying the name of the user returned by the API. Review the instructions`
            )
          );
        }
      };

      const setsProfileImage = profile => {
        const img = select('img');
        if (img.src !== profile.picture.large) {
          reject(
            new Error(
              `You are not displaying the specified user photo returned by the API. Review the instructions`
            )
          );
        }
      };

      const setsCorrectBirthdate = profile => {
        const details = select('.details');

        const btn = select('#btn-birthdate');
        btn.click();
        const actualAge = `${details.textContent}`;
        details.textContent = '';
        if (actualAge !== `${profile.dob.age} years old`) {
          reject(
            new Error(
              `Your displayBirthdate function is not displaying the specified user age returned by the API.`
            )
          );
        }
      };

      const setsCorrectAddress = profile => {
        const details = select('.details');

        const btn = select('#btn-address');
        btn.click();
        const actualAddr = `${details.textContent}`;
        details.textContent = '';
        const { street, city, state } = profile.location;
        if (actualAddr !== `${street}, ${city}, ${state}`) {
          reject(
            new Error(
              `Your displayAddress function is not displaying the required user address returned by the API.`
            )
          );
        }
      };

      const setsCorrectPhone = profile => {
        const details = select('.details');

        const btn = select('#btn-phone');
        btn.click();
        const actualContact = `${details.textContent}`;
        details.textContent = '';
        if (actualContact !== `${profile.phone} / ${profile.cell}`) {
          reject(
            new Error(
              `Your displayPhone function is not displaying the required user contacts returned by the API.`
            )
          );
        }
      };

      const stepFour = () => {
        const nodeIsDisplayUserPhotoAndNameFn = node => {
          return (
            node &&
            node.type === 'VariableDeclarator' &&
            node.id.type === 'Identifier' &&
            node.id.name === 'displayUserPhotoAndName' &&
            node.init.type === 'ArrowFunctionExpression' &&
            node.init.params &&
            node.init.params[0] &&
            node.init.params[0].type === 'Identifier' &&
            node.init.params[0].name === 'data'
          );
        };

        const findDisplayExtraUserInfoCall = node => {
          return (
            node &&
            node.type === 'CallExpression' &&
            node.callee.type === 'Identifier' &&
            node.callee.name === 'displayExtraUserInfo' &&
            node.arguments &&
            node.arguments[0] &&
            node.arguments[0].type === 'Identifier' &&
            node.arguments[0].name === 'profile'
          );
        };

        const hasDisplayExtraUserInfoCall = ({ audits, node }) => {
          const fnName = hasDisplayExtraUserInfoCall.name;
          if (audits[fnName]) return { audits, node };

          audits[fnName] = false;
          if (nodeIsDisplayUserPhotoAndNameFn(node)) {
            const body = node.init.body.body;
            const expressions = body.map(statement => {
              if (
                statement.type === 'ExpressionStatement' &&
                statement.expression
              ) {
                return statement.expression;
              }
            });

            const found = expressions
              .filter(expr => expr !== undefined)
              .find(expr => {
                return findDisplayExtraUserInfoCall(expr);
              });

            if (found) {
              audits[fnName] = true;
            }
          }
          return { audits, node };
        };

        const auditChain = syncChain(hasDisplayExtraUserInfoCall);

        const audits = {};
        const { script } = payload;
        const ast = esprima.parseScript(script);
        estraverse.traverse(ast, {
          enter: function(node) {
            auditChain({ audits, node });
          }
        });

        if (!audits[hasDisplayExtraUserInfoCall.name]) {
          reject(
            new Error(
              `You have not called 'displayExtraUserInfo' from within the displayUserPhotoAndName function`
            )
          );
        }
      };

      const deferredAudit = ({ detail }) => {
        const profile = detail.results[0];

        setsProfileName(profile);
        setsProfileImage(profile);
        stepFour();
        setsCorrectBirthdate(profile);
        setsCorrectAddress(profile);
        setsCorrectPhone(profile);

        resolve(payload);
      };

      document.addEventListener('api-done', deferredAudit, { once: true });

      document.addEventListener(
        'api-done-installed',
        () => {
          document.dispatchEvent(new CustomEvent('api-audit-ready'));
        },
        { once: true }
      );
    });
  }
};
challenges.push(challengeFour);

const pingPong = data => Promise.resolve(data);
const audits = challenges.reduce((pool, challenge, index) => {
  let steps = Object.values(challenge);
  let start = index === 0 ? userbeganChallenges : pingPong;
  return [...pool, asyncChain(start, ...steps, userCompletedThisChallenge)];
}, []);

const gradr = asyncChain(...audits);