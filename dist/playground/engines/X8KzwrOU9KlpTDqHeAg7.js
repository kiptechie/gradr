const challenges = [];
const gradrInstrumentation = program => program;

const challengeOne = {
  stepOne (payload) {
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const haltWithFeedback = haltAuditWith(reject);

      failedAsExpected = on('body')
        .ifThe('background-color', asHex, isNotEqual('#ffffff'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(`BODY should have a WHITE background color.`);
      }

      const filterBtn = select(
        'button#filter-query.mdc-icon-button.material-icons'
      );
      if (!filterBtn || !trim(filterBtn.textContent).includes('filter_list')) {
        haltWithFeedback(
          `You have not created the #filter-query BUTTON as specified.`
        );
      }

      const selectDiv = select('div.select');
      const selectEl = select('div.select select.select-text');
      if (!selectDiv || !selectEl) {
        haltWithFeedback(
          `You either dont have a .select DIV or there's no .select-text SELECT within it`
        );
      }

      const defaultOption = select(
        `select.select-text option[selected][disabled]`
      );
      if (!defaultOption || trim(defaultOption.textContent) === '') {
        haltWithFeedback(
          `Your SELECT element does not have the speficied default OPTION`
        );
      }

      const userPhoto = select('div.user-photo');
      const userImg = select('div.user-photo img');
      if (!userPhoto || !userImg) {
        haltWithFeedback(
          `You need to have a .user-photo DIV and an image inside it`
        );
      }

      if (
        !trim(userImg.src).includes('via.placeholder.com') ||
        trim(userImg.getAttribute('alt')) === ''
      ) {
        haltWithFeedback(
          `Provide the user IMAGE a placeholder iamge and an alternate text as specified`
        );
      }

      const detailsDiv = select('div.details.mdc-elevation--z3');
      if (!detailsDiv) {
        haltWithFeedback(`You need to create a .details DIV as specified`);
      }

      const pCount = detailsDiv.querySelectorAll('p').length;
      const spanCount = detailsDiv.querySelectorAll('span').length;
      const propCount = detailsDiv.querySelectorAll('span.prop').length;
      const valueCount = detailsDiv.querySelectorAll('span.value').length;
      if (
        pCount !== 5 ||
        spanCount !== 10 ||
        propCount !== 5 ||
        valueCount !== 5
      ) {
        haltWithFeedback(
          `You have not created the right number of PARAGRAPH and SPAN elements within the .details DIV as specified`
        );
      }

      resolve(payload);
    });
  },

  stepTwo (payload) {
    return new Promise((resolve, reject) => {
      const halt = haltAuditWith(reject);

      const props = ['age', 'height', 'weight', 'gender', 'country'];
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

  stepThree (payload) {
    return new Promise((resolve, reject) => {
      const halt = haltAuditWith(reject);

      const oracleBtn = select('button#oracle.mdc-button');
      if (!oracleBtn || trim(oracleBtn.textContent) === '') {
        halt(
          'You are required to have a #orcale BUTTON with a reasonable call-to-action text'
        );
      }

      const outcomeDiv = select('div#outcome');
      const outcomeHead = select('div#outcome .mdc-typography--headline5');
      const outcomeText = select('div#outcome p');
      if (!outcomeDiv || !outcomeHead || !outcomeText) {
        halt(
          'As specified, you need to create an #outcome DIV which contains a HEADING and a PARAGRAPH'
        );
      }

      resolve(payload);
    });
  },

  stepFour (payload) {
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const halt = haltAuditWith(reject);

      failedAsExpected = on('div.select')
        .ifThe('margin-bottom', asPixelsToInt, isNotEqual(40))
        .tellMe();

      if (failedAsExpected) {
        halt('The .select DIV does not have the specified CSS style');
      }

      failedAsExpected = on('div.user-photo')
        .ifThe('width', asPixelsToInt, isNotEqual(150))
        .ifThe('height', asPixelsToInt, isNotEqual(150))
        .ifThe('overflow', asIs, isNotEqual('hidden'))
        .ifThe('border-radius', asIs, isNotEqual('50%'))
        .tellMe();

      if (failedAsExpected) {
        halt('The .user-photo DIV does not have the specified CSS style');
      }

      resolve(payload);
    });
  },

  stepFive (payload) {
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const halt = haltAuditWith(reject);

      failedAsExpected = on('div.details')
        .ifThe('color', asHex, isNotEqual('#ffffff'))
        .ifThe('padding', asIs, isNotEqual('10.4px 20.8px'))
        .ifThe('font-size', asPixelsToFloat, isNotEqual(20.8))
        .ifThe('margin-top', asPixelsToFloat, isNotEqual(83.2))
        .ifThe('background-color', asHex, isNotEqual('#6200ee'))
        .tellMe();

      if (failedAsExpected) {
        halt('The .details DIV does not have the specified CSS style');
      }

      const erringP = [...selectAll('.details p')].find(p =>
        on(p)
          .ifThe('margin', asPixelsToFloat, isNotEqual(6.24))
          .tellMe()
      );
      if (erringP) {
        halt(
          'The PARAGRAPH elements in the .details DIV do not have the specified margins'
        );
      }

      failedAsExpected = on('div#outcome')
        .ifThe('position', asIs, isNotEqual('absolute'))
        .ifThe('right', asIs, isNotEqual('35.2px'))
        .ifThe('bottom', asIs, isNotEqual('104px'))
        .ifThe('width', asIs, isNotEqual('100px'))
        .ifThe('text-align', asIs, isNotEqual('center'))
        .tellMe();

      if (failedAsExpected) {
        halt('The #outcome DIV does not have the specified CSS style');
      }

      failedAsExpected = on('div#outcome .mdc-typography--headline5')
        .ifThe('padding', asIs, isNotEqual('24px'))
        .ifThe('background-color', asHex, isNotEqual('#ffffff'))
        .ifThe('border-radius', asIs, isNotEqual('10%'))
        .ifThe('margin', asIs, isNotEqual('0px'))
        .tellMe();

      if (failedAsExpected) {
        halt(
          'The HEADING in the #outcome DIV does not have the specified CSS style'
        );
      }

      failedAsExpected = on('div#outcome p')
        .ifThe('color', asHex, isNotEqual('#ffffff'))
        .ifThe(
          'border-bottom',
          asIs,
          isNotEqual('5px solid rgb(255, 255, 255)')
        )
        .ifThe('font-size', asIs, isNotEqual('32px'))
        .ifThe('margin', asIs, isNotEqual('0px'))
        .ifThe('padding', asIs, isNotEqual('16px 0px'))
        .tellMe();

      if (failedAsExpected) {
        halt(
          'The PARAGRAPH in the #outcome DIV does not have the specified CSS style'
        );
      }

      resolve(payload);
    });
  },

  stepSix (payload) {
    return new Promise((resolve, reject) => {
      const halt = haltAuditWith(reject);

      let failedAsExpected = on('button#oracle')
        .ifThe('margin-top', asIs, isNotEqual('35px'))
        .ifThe('border', asIs, doesNotInclude('1px solid'))
        .ifThe('width', asPixelsToInt, isOrUnder(340)) // instead of 344px
        .tellMe();

      if (failedAsExpected) {
        halt(
          'The HEADING in the #outcome DIV does not have the specified CSS style'
        );
      }

      resolve(payload);
    });
  }
};
challenges.push(challengeOne);

const challengeTwo = {
  stepOne (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const declaresUsersArray = createAudit(queryExpressionDeclaration, {
        name: 'users',
        exprType: 'ArrayExpression'
      });
      const taskOne = audit(declaresUsersArray).and(
        haltWithFeedback(
          'You need to create a "users" Array. Also, make sure to declare it as a constant!'
        )
      );

      const displaySelectedUserFn = createAudit(queryArrowFunction, {
        name: 'displaySelectedUser'
      });
      const taskTwo = audit(displaySelectedUserFn).and(
        haltWithFeedback(
          `You dont have a "displaySelectedUser" arrow function. Also, make sure to declare it as a constant!`
        )
      );

      const letsCalculateBMIFn = createAudit(queryArrowFunction, {
        name: 'letsCalculateBMI'
      });
      const taskThree = audit(letsCalculateBMIFn).and(
        haltWithFeedback(
          `You dont have a "letsCalculateBMI" arrow function. Also, make sure to declare it as a constant!`
        )
      );

      const powerupTheUIFn = createAudit(queryArrowFunction, {
        name: 'powerupTheUI'
      });
      const taskFour = audit(powerupTheUIFn).and(
        haltWithFeedback(
          `You dont have a "powerupTheUI" arrow function. Also, make sure to declare it as a constant!`
        )
      );

      const startAppHasRequiredCalls = createAudit(queryNamedArrowFnHasCalls, {
        name: 'startApp',
        calls: ['powerupTheUI', 'fetchAndDisplayUsers']
      });
      const taskFive = audit(startAppHasRequiredCalls).and(
        haltWithFeedback(
          `You need to call "powerupTheUI" followed by "fetchAndDisplayUsers" within the startApp function.`
        )
      );

      const audits = chain(taskOne, taskTwo, taskThree, taskFour, taskFive);
      await auditJavascript(script, audits);

      resolve(payload);
    });
  },

  stepTwo (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const powerupTheUIHasEventListeners = createAudit(
        queryNamedArrowFnAddsEventsListener,
        {
          name: 'powerupTheUI',
          events: [
            { type: 'change', handler: 'displaySelectedUser' },
            { type: 'click', handler: 'letsCalculateBMI' }
          ]
        }
      );

      const taskOne = audit(powerupTheUIHasEventListeners).and(
        haltWithFeedback(
          'As specified, you need to set "change" and "click" listeners for certain UI elements from within the "powerupTheUI" function'
        )
      );

      await auditJavascript(script, chain(taskOne));

      resolve(payload);
    });
  },

  stepThree (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const displayUsersUpdatesTheUI = async ({ ast, astq }) => {
        const allMapped = users.map(({ id, name }) => {
          const mapped = select(`select.select-text option[value=${id}]`);
          if (mapped && mapped.textContent === name) return true;

          return false;
        });

        return users.length >= 2 && allMapped.includes(false) === false;
      };

      const displayUsersHasParamAndCallsForEachOnIt = async ({ ast, astq }) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'displayUsers'] 
                && /:init ArrowFunctionExpression [
                  /:params Identifier [@name == 'users']
                  && /:body BlockStatement [
                  /:body ExpressionStatement [
                    // MemberExpression [
                      /:object Identifier [@name == 'users']
                      && /:property Identifier [@name == 'forEach']
                    ]
                  ]]
                ]
              ]
            ]
          `;
          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const taskOne = audit(displayUsersHasParamAndCallsForEachOnIt).and(
        haltWithFeedback(
          'Create a "displayUsers" function that iterates over its parameter and updates the UI. See the instructions for details.'
        )
      );

      const taskTwo = audit(displayUsersUpdatesTheUI).and(
        haltWithFeedback(
          'Your "displayUsers" function does not seem to update the UI correctly. See the instructions for details.'
        )
      );

      await auditJavascript(script, chain(taskOne, taskTwo));

      resolve(payload);
    });
  },

  stepFour (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const getSelectedUserCallsFind = async ({ ast, astq }) => {
        try {
          const query = `
          //VariableDeclaration [
            @kind == 'const' &&
            /:declarations VariableDeclarator [
              /:id Identifier [@name == 'getSelectedUser'] 
              && /:init ArrowFunctionExpression [
                /:params Identifier [@name == 'userId']
                && /:body BlockStatement [
                 /:body ReturnStatement [
                  /:argument CallExpression [
                   /:callee MemberExpression [
                     /:object Identifier [@name == 'users']
                     && /:property Identifier [@name == 'find']
                   ]
                   && /:arguments ArrowFunctionExpression [
                     /:params ObjectPattern //Identifier [@name == 'id']
                   ]
                  ]
                ]]
              ]
            ]
          ]
          `;
          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const taskOne = audit(getSelectedUserCallsFind).and(
        haltWithFeedback(
          'Create a "getSelectedUser" function that returns the selected "user object". See the instructions for details.'
        )
      );

      await auditJavascript(script, chain(taskOne));
      resolve(payload);
    });
  },

  stepFive (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const displaySelectedUserFn = async ({ ast, astq }) => {
        try {
          const query = `
              //VariableDeclaration [
                @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'displaySelectedUser'] 
                  && /:init ArrowFunctionExpression [
                    /:params ObjectPattern //Property [
                      @shorthand == true
                      && /:value Identifier [@name == 'target']
                    ]
                    && /:body BlockStatement [
                    //VariableDeclaration [
                      @kind == 'const' &&
                      /:declarations VariableDeclarator [
                        /:id Identifier [@name == 'user']
                        && /:init CallExpression [
                    /:callee Identifier [@name == 'getSelectedUser']
                    && /:arguments MemberExpression [
                      /:object Identifier [@name == 'target']
                      && /:property Identifier [@name == 'value']
                    ]
                  ]
                      ] 
                    ]
                    
                    && //VariableDeclaration [
                      @kind == 'const' &&
                      /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'properties']
                        && /:init CallExpression [
                    /:callee MemberExpression [
                                /:object Identifier [@name == 'Object']
                                && /:property Identifier [@name == 'keys']
                            ]
                    && /:arguments Identifier [@name == 'user']
                  ]
                  ]
                    ]
                    
                    && //CallExpression [
                      /:callee MemberExpression [
                          /:object Identifier [@name == 'properties']
                          && /:property Identifier [@name == 'forEach']
                        ]
                      ]
                    
                    ]
                  ]
                ]
            ]
          `;
          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const taskOne = audit(displaySelectedUserFn).and(
        haltWithFeedback(
          'Create a "displaySelectedUser" function that updates the UI with the selected "user" properties. See the instructions for details.'
        )
      );
      await auditJavascript(script, chain(taskOne));

      resolve(payload);
    });
  }
};
challenges.push(challengeTwo);

const challengeThree = {
  stepOne (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const computeBMIFn = async ({ ast, astq }) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'computeBMI'] 
                && /:init ArrowFunctionExpression [
                  /:params ObjectPattern [
                      /:properties Property [
                        @shorthand == true
                        && /:key Identifier [@name == 'weight']
                      ]

                      && /:properties Property [
                        @shorthand == true
                        && /:key Identifier [@name == 'height']
                      ]
                    
                     && /:properties Property [
                        @shorthand == true
                        && /:key Identifier [@name == 'country']
                      ]
                  ]
                ]
              ]
            ]
          `;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const taskOne = audit(computeBMIFn).and(
        haltWithFeedback(
          'Create a "computeBMI" function with the specified parameter structure. It updates the UI with the selected "user" properties. See the instructions for details.'
        )
      );

      await auditJavascript(script, chain(taskOne));
      resolve(payload);
    });
  },

  stepTwo (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const letsCalculateBMIFn = async ({ ast, astq }) => {
        try {
          const query = `
            //VariableDeclaration [
                @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'letsCalculateBMI'] 
                  && /:init ArrowFunctionExpression [
                /:body BlockStatement [
                      //VariableDeclaration [
                        @kind == 'const' &&
                          /:declarations VariableDeclarator [
                            /:id Identifier [@name == 'user']
                      && /:init CallExpression [
                        /:callee Identifier [@name == 'getSelectedUser']
                      ]
                        ]
                      ]
                        
                        && //VariableDeclaration [
                        @kind == 'const' &&
                          /:declarations VariableDeclarator [
                            /:id Identifier [@name == 'bmi']
                      && /:init CallExpression [
                        /:callee Identifier [@name == 'computeBMI']
                        && /:arguments Identifier [@name == 'user']
                      ]
                        ]
                      ]
                    ]
                  ]
               ]
            ]
          `;
          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const taskOne = audit(letsCalculateBMIFn).and(
        haltWithFeedback(
          'Create a "letsCalculateBMI" function that delegates to "getSelectedUser" and "computeBMI" so it can do its job. See the instructions for details.'
        )
      );

      await auditJavascript(script, chain(taskOne));
      resolve(payload);
    });
  },

  stepThree (payload) {
    return new Promise(async (resolve, reject) => {
      const stars = [
        'Chad',
        'Sierra Leone',
        'Mali',
        'Gambia',
        'Uganda',
        'Ghana',
        'Senegal',
        'Somalia',
        'Ivory Coast',
        'Isreal'
      ];

      const myComputeBMI = ({ weight, height, country }) => {
        const hInMeters = height * 0.3048;
        const value =
          (weight / (hInMeters * hInMeters)) *
          (stars.includes(country) ? 0.82 : 1);
        return parseFloat(value).toFixed(1);
      };

      users = users || [];
      const user = users[0];
      if (!user) {
        reject(
          new Error(
            `Something's not right! You either have not properly declared the 'users' array or it currently has no entries?`
          )
        );
      }

      const updatedUser = { ...user, ...{ country: 'Uganda' } };
      const failMsg =
        'Awwww snap! Your BMI calculation is not correct. Review the instructions and continue.';

      if (computeBMI(user) !== myComputeBMI(user)) {
        reject(new Error(failMsg));
      }

      if (computeBMI(updatedUser) !== myComputeBMI(updatedUser)) {
        reject(new Error(failMsg));
      }

      resolve(payload);
    });
  }
};
challenges.push(challengeThree);

const challengeFour = {
  stepOne (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const fetchWithAPIAndDisplaysUserData = async ({ ast, astq }) => {
        try {
          const query = `
            //VariableDeclaration [
                @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'fetchAndDisplayUsers'] 
                  && /:init ArrowFunctionExpression [
                  /:body BlockStatement [
                        //VariableDeclaration [
                          @kind == 'const' &&
                          /:declarations VariableDeclarator [
                            /:id Identifier [@name == 'api']
                            && /:init Literal [@value == 'https://randomapi.com/api/y1lfp11q?key=LEIX-GF3O-AG7I-6J84']
                          ]
                        ]
                        
                        && //CallExpression [
                            /:callee MemberExpression [
                      /:object CallExpression [
                                  /:callee MemberExpression [
                                  /:property Identifier [@name == 'then']
                        && /:object CallExpression [
                          /:arguments ArrowFunctionExpression [
                                          /:body CallExpression [
                                              /:callee MemberExpression [
                                                /:property Identifier [@name == 'json']
                                            ]
                                          ]
                                        ]
                          && /:callee MemberExpression [
                            /:property Identifier [@name == 'then']
                            && /:object CallExpression [
                              /:arguments Identifier [@name == 'api']
                              && /:callee Identifier [@name == 'fetch']
                            ]
                          ]
                        ]
                                  ]
                                  && /:arguments ArrowFunctionExpression [
                        /:params ObjectPattern [
                                      //Property [/:value Identifier[@name == 'results']]
                                    ]
                        && /:body BlockStatement [
                          //VariableDeclarator [
                            /:id ArrayPattern // Identifier [@name == 'user']
                            && /:init Identifier [@name == 'results']
                          ]
                                        
                                        && //CallExpression [
                                          /:callee Identifier [@name == 'displayUsers']  
                            && /:arguments ArrayExpression [
                              /:elements Identifier [@name == 'user']
                            ]
                                        ]
                        ]
                        ]
                                ]
                    ]
                        ]
                    ]
              ]
              ]
            ]
          `;
          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const taskOne = audit(fetchWithAPIAndDisplaysUserData).and(
        haltWithFeedback(
          'The "fetchAndDisplayUsers" function is missing one or more requirements. See the instructions for details.'
        )
      );

      await auditJavascript(script, chain(taskOne));

      setTimeout(() => {
        users = users || [];
        if (users.length < 3) {
          halt(
            'Your code looks good but no user is being added as a result of your API call. Take another look at your code'
          );
        }
        resolve(payload);
      }, 3000);
    });
  }
};
challenges.push(challengeFour);

const audits = challenges.reduce((pool, challenge, index) => {
  let steps = Object.values(challenge);
  let start = index === 0 ? userBeganChallenges : pingPong;
  return [...pool, asyncChain(start, ...steps, userCompletedThisChallenge)];
}, []);

const gradr = asyncChain(...audits);
