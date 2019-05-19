const trim = (raw = "") => `${raw}`.trim();
const select = document.querySelector.bind(document);
const selectAll = document.querySelectorAll.bind(document);

// get computed property style
const css = (selectorOrNode, prop) => {
  if (!selectorOrNode) return "";

  const node =
    typeof selectorOrNode === "string"
      ? select(selectorOrNode)
      : selectorOrNode;

  if (!node) return "";

  return window.getComputedStyle(node).getPropertyValue(prop);
};

const the = prop => {
  const of = nodeOrSelector => {
    return css(nodeOrSelector, prop);
  };

  return {
    of
  };
};

const haltAuditWith = reject => msg => {
  reject(new Error(msg));
};

const audit = fn => ({ accumulator, node }) => {
  if (accumulator[fn.name]) return { accumulator, node };

  accumulator[fn.name] = fn(node);
  return { accumulator, node };
};

const auditAST = (script, check) => {
  const executeAudit = halt => {
    const accumulator = {};
    const ast = esprima.parseScript(script);
    estraverse.traverse(ast, {
      enter: function(node) {
        check({ accumulator, node });
      }
    });

    if (Object.values(accumulator).includes(false)) {
      halt();
    }
  };

  return {
    and: haltFn => {
      executeAudit(haltFn);
    }
  };
};

const isArrowFunction = (node, name, kind='const') =>
  node &&
  node.type === "VariableDeclaration" &&
  node.kind === kind &&
  node.declarations &&
  node.declarations[0].type === "VariableDeclarator" &&
  node.declarations[0].id &&
  node.declarations[0].id.type === "Identifier" &&
  node.declarations[0].id.name === name &&
  node.declarations[0].init &&
  node.declarations[0].init.type === "ArrowFunctionExpression";

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

const gradrInstrumentation = program => {
  return program;
};

const challengeOne = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const halt = haltAuditWith(reject);

      let bodyBg = css("body", "background-color");
      bodyBg = bodyBg.replace(/\s+/g, "");
      if (bodyBg !== "rgb(255,255,255)") {
        halt(`BODY should have a WHITE background color.`);
      }

      const filterBtn = select(
        "button#filter-query.mdc-icon-button.material-icons"
      );
      if (!filterBtn || !trim(filterBtn.textContent).includes("filter_list")) {
        halt(`You have not created the #filter-query BUTTON as specified.`);
      }

      const selectDiv = select("div.select");
      const selectEl = select("div.select select.select-text");
      if (!selectDiv || !selectEl) {
        halt(
          `You either dont have a .select DIV or there's no .select-text SELECT within it`
        );
      }

      const defailtOption = selectEl.querySelector(
        `option[selected][disabled]`
      );
      if (!defailtOption || trim(defailtOption.textContent) === "") {
        halt(`Your SELECT element does not have the speficied default OPTION`);
      }

      const userPhoto = select("div.user-photo");
      const userImg = select("div.user-photo img");
      if (!userPhoto || !userImg) {
        halt(`You need to have a .user-photo DIV and an image inside it`);
      }

      if (
        !trim(userImg.src).includes("via.placeholder.com") ||
        trim(userImg.getAttribute("alt")) === ""
      ) {
        halt(
          `Provide the user IMAGE a placeholder iamge and an alternate text as specified`
        );
      }

      const detailsDiv = select("div.details.mdc-elevation--z3");
      if (!detailsDiv) {
        halt(`You need to create a .details DIV as specified`);
      }

      const pCount = detailsDiv.querySelectorAll("p").length;
      const spanCount = detailsDiv.querySelectorAll("span").length;
      const propCount = detailsDiv.querySelectorAll("span.prop").length;
      const valueCount = detailsDiv.querySelectorAll("span.value").length;
      if (
        pCount !== 5 ||
        spanCount !== 10 ||
        propCount !== 5 ||
        valueCount !== 5
      ) {
        halt(
          `You have not created the right number of PARAGRAPH and SPAN elements within the .details DIV as specified`
        );
      }

      resolve(payload);
    });
  },

  stepTwo(payload) {
    return new Promise((resolve, reject) => {
      const halt = haltAuditWith(reject);

      const props = ["age", "height", "weight", "gender", "country"];
      const attrsSum = props.reduce((sum, prop) => {
        if (select(`[data-${prop}]`)) sum += 1;
        if (select(`[data-${prop}-value]`)) sum += 1;

        return sum;
      }, 0);

      if (attrsSum !== 10) {
        halt(
          `You have not given all the SPAN elements within the .details DIV and specified attributes`
        );
      }

      resolve(payload);
    });
  },

  stepThree(payload) {
    return new Promise((resolve, reject) => {
      const halt = haltAuditWith(reject);

      const oracleBtn = select("button#oracle.mdc-button");
      if (!oracleBtn || trim(oracleBtn.textContent) === "") {
        halt(
          "You are required to have a #orcale BUTTON with a reasonable call-to-action text"
        );
      }

      const outcomeDiv = select("div#outcome");
      const outcomeHead = select("div#outcome .mdc-typography--headline5");
      const outcomeText = select("div#outcome p");
      if (!outcomeDiv || !outcomeHead || !outcomeText) {
        halt(
          "As specified, you need to create an #outcome DIV which contains a HEADING and a PARAGRAPH"
        );
      }

      resolve(payload);
    });
  },

  stepFour(payload) {
    return new Promise((resolve, reject) => {
      const halt = haltAuditWith(reject);

      if (the("margin-bottom").of("div.select") !== "40px") {
        halt("The .select DIV does not have the specified CSS style");
      }

      if (
        the("width").of("div.user-photo") !== "150px" ||
        the("height").of("div.user-photo") !== "150px" ||
        the("overflow").of("div.user-photo") !== "hidden" ||
        the("border-radius").of("div.user-photo") !== "50%"
      ) {
        halt("The .user-photo DIV does not have the specified CSS style");
      }

      resolve(payload);
    });
  },

  stepFive(payload) {
    return new Promise((resolve, reject) => {
      const halt = haltAuditWith(reject);

      if (
        the("color").of("div.details") !== "rgb(255, 255, 255)" ||
        the("background-color").of("div.details") !== "rgb(98, 0, 238)" ||
        the("font-size").of("div.details") !== "20.8px" ||
        the("margin-top").of("div.details") !== "83.2px" ||
        the("padding").of("div.details") !== "10.4px 20.8px"
      ) {
        halt("The .details DIV does not have the specified CSS style");
      }

      const erringP = [...selectAll(".details p")].find(
        p => the("margin").of(p) !== "6.24px"
      );
      if (erringP) {
        halt(
          "The PARAGRAPH elements in the .details DIV do not have the specified margins"
        );
      }

      if (
        the("position").of("div#outcome") !== "absolute" ||
        the("right").of("div#outcome") !== "35.2px" ||
        the("bottom").of("div#outcome") !== "104px" ||
        the("width").of("div#outcome") !== "100px" ||
        the("text-align").of("div#outcome") !== "center"
      ) {
        halt("The #outcome DIV does not have the specified CSS style");
      }

      if (
        the("padding").of("div#outcome .mdc-typography--headline5") !==
          "24px" ||
        the("background-color").of("div#outcome .mdc-typography--headline5") !==
          "rgb(255, 255, 255)" ||
        the("border-radius").of("div#outcome .mdc-typography--headline5") !==
          "10%" ||
        the("margin").of("div#outcome .mdc-typography--headline5") !== "0px"
      ) {
        halt(
          "The HEADING in the #outcome DIV does not have the specified CSS style"
        );
      }

      if (
        the("color").of("div#outcome p") !== "rgb(255, 255, 255)" ||
        the("border-bottom").of("div#outcome p") !==
          "5px solid rgb(255, 255, 255)" ||
        the("font-size").of("div#outcome p") !== "32px" ||
        the("margin").of("div#outcome p") !== "0px" ||
        the("padding").of("div#outcome p") !== "16px 0px"
      ) {
        halt(
          "The PARAGRAPH in the #outcome DIV does not have the specified CSS style"
        );
      }

      resolve(payload);
    });
  },

  stepSix(payload) {
    return new Promise((resolve, reject) => {
      const halt = haltAuditWith(reject);

      if (
        the("margin-top").of("button#oracle") !== "35px" ||
        !the("border")
          .of("button#oracle")
          .includes("1px solid") ||
        the("width").of("button#oracle") !== "344px"
      ) {
        halt("The #outcome BUTTON does not have the specified CSS style");
      }

      resolve(payload);
    });
  }
};
challenges.push(challengeOne);

const challengeTwo = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const halt = haltAuditWith(reject);
      const haltAS = msg => () => halt(msg);

      const declaredUsersArray = node =>
        node &&
        node.type === "VariableDeclaration" &&
        node.kind === "const" &&
        node.declarations &&
        node.declarations[0] &&
        node.declarations[0].type === "VariableDeclarator" &&
        node.declarations[0].id &&
        node.declarations[0].id.type === "Identifier" &&
        node.declarations[0].id.name === "users" &&
        node.declarations[0].init &&
        node.declarations[0].init.type === "ArrayExpression";

      const startAppInvocations = node => {
        const bodyHasBothCalls = statements => {
          let fns = ["powerupTheUI", "fetchAndDisplayUsers"];
          const fnNames = statements.reduce((accounted, s) => {
            if (
              s &&
              s.expression &&
              s.expression.type === "CallExpression" &&
              s.expression.callee &&
              fns.includes(s.expression.callee.name)
            ) {
              fns = fns.filter(fn => fn !== s.expression.callee.name);
              accounted.push(s.expression.callee.name);
            }
            return accounted;
          }, []);

          return (
            fnNames.length === 2 &&
            fnNames.join("-") === "powerupTheUI-fetchAndDisplayUsers"
          );
        };

        return (
          node &&
          node.type === "VariableDeclarator" &&
          node.id.type === "Identifier" &&
          node.id.name === "startApp" &&
          node.init &&
          node.init.type === "ArrowFunctionExpression" &&
          node.init.body &&
          node.init.body.type === "BlockStatement" &&
          bodyHasBothCalls(node.init.body.body)
        );
      };

      const powerupTheUIFn = node =>
        isArrowFunction(node, "powerupTheUI");
      const letsCalculateBMIFn = node =>
        isArrowFunction(node, "letsCalculateBMI");
      const displaySelectedUserFn = node =>
        isArrowFunction(node, "displaySelectedUser");

      let auditor = syncChain(audit(declaredUsersArray));
      auditAST(script, auditor).and(
        haltAS(
          'You need to create a "users" Array. Also, make sure to declare it as a constant!'
        )
      );

      auditor = syncChain(audit(displaySelectedUserFn));
      auditAST(script, auditor).and(
        haltAS(
          `You dont have a "displaySelectedUser" arrow function. Also, make sure to declare it as a constant!`
        )
      );

      auditor = syncChain(audit(letsCalculateBMIFn));
      auditAST(script, auditor).and(
        haltAS(
          `You dont have a "letsCalculateBMI" arrow function. Also, make sure to declare it as a constant!`
        )
      );

      auditor = syncChain(audit(powerupTheUIFn));
      auditAST(script, auditor).and(
        haltAS(
          `You dont have a "powerupTheUI" arrow function. Also, make sure to declare it as a constant!`
        )
      );

      auditor = syncChain(audit(startAppInvocations));
      auditAST(script, auditor).and(
        haltAS(
          `You need to call "powerupTheUI" and "fetchAndDisplayUsers" within the startApp function.`
        )
      );

      resolve(payload);
    });
  },

  stepTwo(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const halt = haltAuditWith(reject);
      const haltAS = msg => () => halt(msg);

      const hasEventListener = (statements, event, listener) => {
        return statements.find(s => {
          return (
            s &&
            s.type === "ExpressionStatement" &&
            s.expression &&
            s.expression.type === "CallExpression" &&
            s.expression.callee &&
            s.expression.callee.type === "MemberExpression" &&
            s.expression.callee.property.name === "addEventListener" &&
            s.expression.arguments &&
            s.expression.arguments[0] &&
            s.expression.arguments[0].value === event &&
            s.expression.arguments[1] &&
            s.expression.arguments[1].name === listener
          );
        });
      };

      const isPowerupTheUIFn = node => {
        return (
          node &&
          node.type === "VariableDeclarator" &&
          node.id &&
          node.id.name === "powerupTheUI" &&
          node.init &&
          node.init.type === "ArrowFunctionExpression"
        );
      };

      const displaySelectedUserListener = node => {
        return (
          isPowerupTheUIFn(node) &&
          node.init.body &&
          node.init.body.body &&
          hasEventListener(node.init.body.body, "change", "displaySelectedUser")
        );
      };

      const letsCalculateBMIListener = node => {
        return (
          isPowerupTheUIFn(node) &&
          node.init.body &&
          node.init.body.body &&
          hasEventListener(node.init.body.body, "click", "letsCalculateBMI")
        );
      };

      // const avoidsForbiddenDOMAPI = node => {
      //   return (
      //     node &&
      //     node.type === "CallExpression" &&
      //     node.callee.type === "MemberExpression" &&
      //     [
      //       "getElementById",
      //       "getElementsByClassName",
      //       "getElementsByTagName"
      //     ].includes(node.callee.property.name) === false
      //   );
      // };

      // const avoidsInnerHTML = node => {
      //   return (
      //     node &&
      //     node.type === "ExpressionStatement" &&
      //     node.expression &&
      //     node.expression.type === "MemberExpression" &&
      //     node.expression.property.name !== "innerHTML"
      //   );
      // };

      let auditor = syncChain(
        audit(displaySelectedUserListener),
        audit(letsCalculateBMIListener)
      );
      auditAST(script, auditor).and(
        haltAS(
          'As specified, you need to set "change" and "click" listeners for certain UI elements from within the "powerupTheUI" function'
        )
      );

      resolve(payload);
    });
  },

  stepThree(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const halt = haltAuditWith(reject);
      const haltAS = msg => () => halt(msg);

      const hasRequiredParam = (params) => {
        return params && params[0] &&
        params[0].type === 'Identifier' &&
        params[0].name === 'users';
      };

      const invokesForEachOnParam = (statements) => {
        const found = statements.find(s => {
          return s && s.type === 'ExpressionStatement' &&
          s.expression && s.expression.type === 'CallExpression' &&
          s.expression.callee.type === 'MemberExpression' &&
          s.expression.callee.object.type === 'Identifier' &&
          s.expression.callee.object.name === 'users' &&
          s.expression.callee.property.type === 'Identifier' &&
          s.expression.callee.property.name === 'forEach' &&
          s.expression.arguments && 
          s.expression.arguments[0].type === `ArrowFunctionExpression`;
        });

        return found !== undefined;
      };

      const updatesUI = () => {
        const allMapped = users.map(({id, name}) => {
          const mapped = select(`select.select-text option[value=${id}]`);
          if(mapped && mapped.textContent === name) return true;

          return false;
        });

        return users.length >= 2 && allMapped.includes(false) === false;
      }

      const displayUsersFn = node => {
        return isArrowFunction(node, "displayUsers") &&
        hasRequiredParam(node.declarations[0].init.params) &&
        node.declarations[0].init.body && 
        invokesForEachOnParam(node.declarations[0].init.body.body) &&
        updatesUI()
      };
      
      let auditor = syncChain(
        audit(displayUsersFn)
      );
      auditAST(script, auditor).and(
        haltAS(
          'Create a "displayUsers" function that iterates over its parameter and updates the UI. See the instructions for details.'
        )
      );

      resolve(payload);
    });
  },

  stepFour(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const halt = haltAuditWith(reject);
      const haltAS = msg => () => halt(msg);
      
      const hasRequiredParam = (params) => {
        return params && params[0] &&
        params[0].type === 'Identifier' &&
        params[0].name === 'userId';
      };
      
      const invokesFindOnUsers = (body) => {
        if(body.type === 'CallExpression') {
          return body.callee.type === 'MemberExpression' &&
          body.callee.object.name === 'users' &&
          body.callee.property.name === 'find'
        } 
        
        if (body.type === 'BlockStatement' && body.body.length === 1 && body.body[0].type === 'ReturnStatement') {
          const stmnt = body.body[0];
          return stmnt.argument.type === 'CallExpression' &&
          stmnt.argument.callee.type === 'MemberExpression' &&
          stmnt.argument.callee.object.name === 'users' &&
          stmnt.argument.callee.property.name === 'find' &&
          stmnt.argument.arguments && stmnt.argument.arguments[0] &&
          stmnt.argument.arguments[0].type === 'ArrowFunctionExpression' &&
          stmnt.argument.arguments[0].params && stmnt.argument.arguments[0].params[0] &&
          stmnt.argument.arguments[0].params[0].type === 'ObjectPattern' &&
          stmnt.argument.arguments[0].params[0].properties.find(p => p.key.name === 'id');
        }

        return false;
      };

      const getSelectedUserFn = node => {
        return isArrowFunction(node, "getSelectedUser") &&
        hasRequiredParam(node.declarations[0].init.params) &&
        node.declarations[0].init.body && 
        invokesFindOnUsers(node.declarations[0].init.body)
      };

      let auditor = syncChain(
        audit(getSelectedUserFn)
      );
      auditAST(script, auditor).and(
        haltAS(
          'Create a "getSelectedUser" function that returns the selected "user object". See the instructions for details.'
        )
      );

      resolve(payload);
    });
  },

  stepFive(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const halt = haltAuditWith(reject);
      const haltAS = msg => () => halt(msg);
      
      const hasDestructuredParam = (params) => {
        return params && params[0] &&
        params[0].type === 'ObjectPattern' &&
        params[0].properties && params[0].properties[0] &&
        params[0].properties[0].key.type === 'Identifier' &&
        params[0].properties[0].key.name === 'target';
      };

      const invokesGetSelectedUser = statements => {
        const found = statements.find(s => {
          return s && s.type === 'VariableDeclaration' &&
          s.declarations[0].type === 'VariableDeclarator' &&
          s.declarations[0].id.name === 'user' &&
          s.declarations[0].init &&
          s.declarations[0].init.type === 'CallExpression' &&
          s.declarations[0].init.callee &&
          s.declarations[0].init.callee.name === 'getSelectedUser' &&
          s.declarations[0].init.arguments && s.declarations[0].init.arguments[0] &&
          s.declarations[0].init.arguments[0].type === 'MemberExpression' &&
          s.declarations[0].init.arguments[0].object.name === 'target' &&
          s.declarations[0].init.arguments[0].property.name === 'value' 
        });

        return found !== undefined;
      };

      const getsPropertiesFromUserObject = (statements) => {
        const found = statements.find(s => {
          return s && s.type === 'VariableDeclaration' &&
          s.declarations[0].type === 'VariableDeclarator' &&
          s.declarations[0].id.name === 'properties' &&
          s.declarations[0].init &&
          s.declarations[0].init.type === 'CallExpression' &&
          s.declarations[0].init.callee &&
          s.declarations[0].init.callee.type === 'MemberExpression' &&
          s.declarations[0].init.callee.object.name === 'Object' &&
          s.declarations[0].init.callee.property.name === 'keys' &&

          s.declarations[0].init.arguments && s.declarations[0].init.arguments[0] &&
          s.declarations[0].init.arguments[0].type === 'Identifier' &&
          s.declarations[0].init.arguments[0].name === 'user';
        });

        return found !== undefined;
      };

      const invokesForEachOnProperties = (statements) => {
        const found = statements.find(s => {
          return s && s.type === 'ExpressionStatement' &&
          s.expression && s.expression.type === 'CallExpression' &&
          s.expression.callee.type === 'MemberExpression' &&
          s.expression.callee.object.type === 'Identifier' &&
          s.expression.callee.object.name === 'properties' &&
          s.expression.callee.property.type === 'Identifier' &&
          s.expression.callee.property.name === 'forEach' &&
          s.expression.arguments && s.expression.arguments[0] &&
          s.expression.arguments[0].type === `ArrowFunctionExpression`;
        });

        return found !== undefined;
      };

      const displaySelectedUserFn = node => {
        return isArrowFunction(node, "displaySelectedUser") &&
        hasDestructuredParam(node.declarations[0].init.params) &&
        node.declarations[0].init.body.body &&
        invokesGetSelectedUser(node.declarations[0].init.body.body) &&
        getsPropertiesFromUserObject(node.declarations[0].init.body.body) &&
        invokesForEachOnProperties(node.declarations[0].init.body.body)
      };

      let auditor = syncChain(
        audit(displaySelectedUserFn)
      );
      auditAST(script, auditor).and(
        haltAS(
          'Create a "displaySelectedUser" function that updates the UI with the selected "user" properties. See the instructions for details.'
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
      const halt = haltAuditWith(reject);
      const haltAS = msg => () => halt(msg);

      const hasDestructuredParams = (params) => {
        const mapProps = (props) => {
          return props.map(({key}) => {
            if(key && key.type === 'Identifier') return key.name;
          });
        };

        return params && params[0] &&
        params[0].type === 'ObjectPattern' &&
        params[0].properties &&
        mapProps(params[0].properties).includes('weight') &&
        mapProps(params[0].properties).includes('height') &&
        mapProps(params[0].properties).includes('country')
      };

      const computeBMIFn = node => {
        return isArrowFunction(node, "computeBMI") &&
        hasDestructuredParams(node.declarations[0].init.params);
      };

      let auditor = syncChain(
        audit(computeBMIFn)
      );
      auditAST(script, auditor).and(
        haltAS(
          'Create a "computeBMI" function that updates the UI with the selected "user" properties. See the instructions for details.'
        )
      );

      resolve(payload);
    });
  },

  stepTwo(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const halt = haltAuditWith(reject);
      const haltAS = msg => () => halt(msg);

      const callsGetSelectedUser = (statements) => {
        const found = statements.find(s => {
          return s && s.type === 'VariableDeclaration' &&
          s.declarations && s.declarations[0] &&
          s.declarations[0].type === 'VariableDeclarator' &&
          s.declarations[0].id.name === 'user' &&
          s.declarations[0].init && 
          s.declarations[0].init.type === 'CallExpression' &&
          s.declarations[0].init.callee &&
          s.declarations[0].init.callee.name === 'getSelectedUser';
        });

        return found !== undefined;
      };

      const callsComputeBMI = statements => {
        const found = statements.find(s => {
          return s && s.type === 'VariableDeclaration' &&
          s.declarations && s.declarations[0] &&
          s.declarations[0].type === 'VariableDeclarator' &&
          s.declarations[0].id.name === 'bmi' &&
          s.declarations[0].init && 
          s.declarations[0].init.type === 'CallExpression' &&
          s.declarations[0].init.callee &&
          s.declarations[0].init.callee.name === 'computeBMI' &&
          s.declarations[0].init.arguments && s.declarations[0].init.arguments[0] &&
          s.declarations[0].init.arguments[0].name === 'user';
        });

        return found !== undefined;
      };

      const letsCalculateBMIFn = node => {
        return isArrowFunction(node, "letsCalculateBMI") &&
        node.declarations[0].init.body && node.declarations[0].init.body.body &&
        callsGetSelectedUser(node.declarations[0].init.body.body) &&
        callsComputeBMI(node.declarations[0].init.body.body)
      };

      let auditor = syncChain(
        audit(letsCalculateBMIFn)
      );
      auditAST(script, auditor).and(
        haltAS(
          'Create a "letsCalculateBMI" function that delegates to "getSelectedUser" and "computeBMI" so it can do its job. See the instructions for details.'
        )
      );

      resolve(payload);
    });
  },

  stepThree(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const halt = haltAuditWith(reject);
      const haltAS = msg => () => halt(msg);

      const stars = ["Chad", "Sierra Leone", "Mali", "Gambia", "Uganda", "Ghana", "Senegal", "Somalia", "Ivory Coast", "and Isreal"];
      const myComputeBMI = ({ weight, height, country }) => {
        const hInMeters = height * 0.3048;
        const value = (weight / (hInMeters * hInMeters)) 
          * (stars.includes(country) ? 0.82 : 1);
        return parseFloat(value).toFixed(1);
      };

      // inspect the computation
      const user = users[0];
      const updatedUser = {};
      Object.keys(user).forEach(key => {
        updatedUser[key] = user[key];
      });
      updatedUser.country = 'Uganda';

      const failMsg = 'Awwww snap! Your BMI calculation is not correct. Review the instructions and continue.';
      if(computeBMI(user) !== myComputeBMI(user)) {
        halt(failMsg);
      }

      if(computeBMI(updatedUser) !== myComputeBMI(updatedUser)) {
        halt(failMsg);
      }

      resolve(payload);
    });
  }
};
challenges.push(challengeThree);

const challengeFour = {
  stepOne(payload) {
    return new Promise((resolve, reject) => {
      const { script } = payload;
      const halt = haltAuditWith(reject);
      const haltAS = msg => () => halt(msg);

      halt('');
      resolve(payload);
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
