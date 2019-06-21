
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
        haltWithFeedback(`The BODY element should have a WHITE background color.`);
      }

      resolve(payload);
    });
  },

  stepTwo (payload) {
    return new Promise((resolve, reject) => {
      const haltWithFeedback = haltAuditWith(reject);

      const appTitle = select('.mdc-typography--headline4');
      if (!appTitle || trim(appTitle.textContent) === '') {
        haltWithFeedback(
          'Create the app title as a HEADING element and with the required class'
        );
      }

      const tip = appTitle.querySelector('span.tip');
      if (!tip) {
        haltWithFeedback(`The app title HEADING needs to contain a SPAN with a 'tip' class`);
      }

      resolve(payload);
    });
  },

  stepThree (payload) {
    return new Promise((resolve, reject) => {
      const haltWithFeedback = haltAuditWith(reject);

      const menu = select('.menu');
      if (!menu) {
        haltWithFeedback(`You don't yet have a DIV with a '.menu' CSS class ?`);
      }

      const items = menu.querySelectorAll('.item');
      if (!items || items.length !== 4) {
        haltWithFeedback(
          `You don't yet have 4 children '.item' DIVs within the '.menu' DIV ?`
        );
      }

      const imgs = menu.querySelectorAll('.item img[src]');
      const prices = menu.querySelectorAll('.item p.mdc-typography--headline6');
      if (imgs.length !== 4 || prices.length !== 4) {
        haltWithFeedback(
          `Your '.item' DIVs do not have the IMAGE and PARAGRAPH setup as required. See the instructions`
        );
      }

      resolve(payload);
    });
  },

  stepFour (payload) {
    return new Promise((resolve, reject) => {
      const haltWithFeedback = haltAuditWith(reject);

      const actions = select('.actions');
      if (!actions) {
        haltWithFeedback(`You don't yet have a DIV with a '.actions' CSS class ?`);
      }

      const stars = actions.querySelectorAll('.material-icons');
      if (!stars || stars.length !== 5) {
        haltWithFeedback(`You don't yet have the number of required rating stars in the '.actions' DIV ?`);
      }

      const hasDataRate = [...stars].map((star, index) => {
        return star.getAttribute('data-rate') === `${index + 1}`;
      });

      if (hasDataRate.includes(false)) {
        haltWithFeedback(
          `The rating stars do not all have a 'data-rate' attribute with the right value, and so, are not properly setup `
        );
      }

      resolve(payload);
    });
  },

  stepFive (payload) {
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const haltWithFeedback = haltAuditWith(reject);

      failedAsExpected = on('.mdc-typography--headline4')
        .ifThe('margin', asIs, isNotEqual('17px'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback('The app title HEADING does not have the required margin');
      }

      failedAsExpected = on('.mdc-typography--headline4 .tip')
        .ifThe('float', asIs, isNotEqual('right'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(`The .tip SPAN within the app title should be positioned at the extremme right`);
      }

      failedAsExpected = on('.menu')
        .ifThe('margin', asIs, isNotEqual('16px 0px'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(`The app '.menu' DIV does not have the required margin`);
      }

      /* This check should run for all 
      *  '.menu .item' elements, but I think
      * it currently only runs for the first match
      */
     failedAsExpected = on('.menu .item')
        .ifThe('width', asPixelsToInt, isNotEqual(137))
        .ifThe('margin', asPixelsToFloat, isNotEqual(6.4))
        .ifThe('padding', asPixelsToFloat, isNotEqual(6.4))
        .ifThe('cursor', asIs, isNotEqual('pointer'))
        .ifThe('border', asIs, isNotEqual('1px solid rgb(255, 255, 255)'))
        .ifThe('display', asIs, isNotEqual('inline-block'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(`Style the '.item' DIVs as specified in the instructions`);
      }

      failedAsExpected = on('.menu img')
        .ifThe('display', asIs, isNotEqual('block'))
        .ifThe('min-width', asIs, isNotEqual('131px'))
        .ifThe('min-height', asIs, isNotEqual('150px'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(`Style the IMAGE elements under each '.item' DIV as specified in the instructions`);
      }

      failedAsExpected = on('.menu p')
        .ifThe('text-align', asIs, isNotEqual('center'))
        .ifThe('min-height', asIs, isNotEqual('32px'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(
          `Style the PARAPGRAMP elements under the '.item' DIV as specified in the instructions`
        );
      }

      resolve(payload);
    });
  },

  stepSix (payload) {
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const haltWithFeedback = haltAuditWith(reject);

      failedAsExpected = on('.actions')
        .ifThe('text-align', asIs, isNotEqual('center'))
        .ifThe('margin-top', asIs, isNotEqual('16px'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(`Style the '.actions' DIV as specified in the instructions`);
      }

      /* TODO
      * This is meach to audit all '.actions .material-icons'
      * not just the first one
      */
      failedAsExpected = on('.actions .material-icons')
        .ifThe('cursor', asIs, isNotEqual('pointer'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(
          `Stars in the '.actions' DIV do not have the required cursor behaviour`
        );
      }

      /* TODO
      * This is meach to audit all '.actions .material-icons'
      * not just the first one
      */
      const star = select('.actions .material-icons');
      star.classList.add('rated');
      const ratedColor = css(star, 'color');
      star.classList.remove('rated');
      if (ratedColor !== 'rgb(255, 165, 0)') {
        haltWithFeedback(`All '.rated' stars should have the specified color. See instructions`);
      }

      /* TODO
      * This is meach to audit all '.actions .material-icons'
      * not just the first one
      */
      const item = select('.menu .item');
      item.setAttribute('data-selected', '');
      const selectedBorder = css(item, 'border-color');
      item.removeAttribute('data-selected');
      if (selectedBorder !== 'rgb(51, 51, 51)') {
        haltWithFeedback(`All selected meal '.item' should have the specified border. See instructions`);
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

      const declaresMenuArray = createAudit(queryExpressionDeclaration, {
        name: 'menu',
        kind: 'let',
        exprType: 'ArrayExpression'
      });

      const declaresFormatMoneyFn = createAudit(queryNamedArrowFnHasParams, {
        name: 'formatMoney', params: ['figure']
      });

      const declaresCalculateTipFn = createAudit(queryArrowFunction, {
        name: 'calculateTip'
      });

      const declaresMealChoosenFn = createAudit(queryArrowFunction, {
        name: 'mealChoosen'
      });

      const declaresRateMealFn = createAudit(queryArrowFunction, {
        name: 'rateMeal'
      });

      const declaresUiCanInteractFn = createAudit(queryArrowFunction, {
        name: 'uiCanInteract'
      });

      const declaresDisplayMenuFn = createAudit(queryNamedArrowFnHasParams, {
        name: 'displayMenu',
        params: ['options']
      });

      const displayMenuFnHasAssignment = async ({ ast, astq }) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'displayMenu'] 
                && /:init ArrowFunctionExpression [
                  /:body BlockStatement [
                      //AssignmentExpression [
                          /:left Identifier [@name == 'menu']
                          && /:right Identifier [@name == 'options']
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

      const declaresFetchAndDisplayMenuFn = createAudit(queryArrowFunction, {
        name: 'fetchAndDisplayMenu'
      });

      const fetchAndDisplayMenuFnHasAssignment = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'fetchAndDisplayMenu'] 
                && /:init ArrowFunctionExpression [
                    /:body BlockStatement [
                      //VariableDeclaration [
                        @kind == 'const' &&
                        /:declarations VariableDeclarator [
                          /:id Identifier [@name == 'api']
                          && /:init Literal [@value == 'https://my.api.mockaroo.com/meals?key=18865cd0']
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

      const startAppDelegatesCorrectly = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
                  @kind == 'const' &&
                  /:declarations VariableDeclarator [
                    /:id Identifier [@name == 'startApp'] 
                    && /:init ArrowFunctionExpression [
                  /:body BlockStatement [
                          //CallExpression [
                              /:callee Identifier [@name == 'fetchAndDisplayMenu']
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

      const tests = [];
      tests.push(
        audit(declaresMenuArray).and(
          haltWithFeedback(
            'You need to create a "menu" Array. Also, make sure it is not declare as a constant!'
          )
        )
      );

      tests.push(
        audit(declaresFormatMoneyFn).and(
          haltWithFeedback('You need to create a "formatMoney" function as specified')
        )
      );

      tests.push(
        audit(declaresCalculateTipFn).and(
          haltWithFeedback(
            'You need to create a calculateTip arrow function as specified'
          )
        )
      );

      tests.push(
        audit(declaresMealChoosenFn).and(
          haltWithFeedback(
            'You need to create a mealChoosen arrow function as specified'
          )
        )
      );

      tests.push(
        audit(declaresRateMealFn).and(
          haltWithFeedback(
            'You need to create a rateMeal arrow function as specified'
          )
        )
      );

      tests.push(
        audit(declaresUiCanInteractFn).and(
          haltWithFeedback(
            'You need to create a uiCanInteract arrow function as specified'
          )
        )
      );

      tests.push(
        audit(declaresDisplayMenuFn).and(
          haltWithFeedback(`You need to create a 'displayMenu' arrow function with the specified parameters`)
        )
      );

      tests.push(
        audit(displayMenuFnHasAssignment).and(
          haltWithFeedback(`Your 'displayMenu' arrow function does not set the value of the 'menu' array`)
        )
      );

      tests.push(
        audit(declaresFetchAndDisplayMenuFn).and(
          haltWithFeedback(`You need to create a 'fetchAndDisplayMenu' arrow function`)
        )
      );

      tests.push(
        audit(fetchAndDisplayMenuFnHasAssignment).and(
          haltWithFeedback(`Your 'fetchAndDisplayMenu' arrow function does not declare an 'api' as specified.`)
        )
      );

      tests.push(
        audit(startAppDelegatesCorrectly).and(
          haltWithFeedback(`The 'startApp' function needs to call your 'fetchAndDisplayMenu' function.`)
        )
      );

      const testSuite = chain(...tests);
      await auditJavascript(script, testSuite);

      resolve(payload);
    });
  },

  stepTwo (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const fetchWithAPIAndCallDisplayMenu = async ({ast, astq}) => {
        try{
          const query = `
          //VariableDeclaration [
            @kind == 'const' &&
            /:declarations VariableDeclarator [
              /:id Identifier [@name == 'fetchAndDisplayMenu'] 
              && /:init ArrowFunctionExpression [
                /:body BlockStatement [
                  // CallExpression [
                    /:callee MemberExpression [
                      /:object CallExpression [
                        /:callee MemberExpression [
                          /:object CallExpression [
                            /:callee Identifier [@name == 'fetch']
                            && /:arguments Identifier [@name == 'api']
                          ]
                          && /:property Identifier [@name == 'then']	
                        ]
                          && /:arguments ArrowFunctionExpression [
                          /:params Identifier [@name == 'response']
                          && //MemberExpression [
                            /:object Identifier [@name == 'response']
                            && /:property Identifier [@name == 'json']
                          ]
                        ]
                      ]
                      && /:property Identifier [@name == 'then']
                    ]
                    && /:arguments ArrowFunctionExpression [
                        /:params Identifier [@name == 'data']
                        && //CallExpression [
                          /:callee Identifier [@name == 'displayMenu']
                          && /:arguments Identifier [@name == 'data']
                        ]
                      ]

                      || /:arguments Identifier [@name == 'displayMenu']
                  ]
                ]
              ]
            ]
          ]`;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };
      
      const taskOne = audit(fetchWithAPIAndCallDisplayMenu).and(
        haltWithFeedback(`Your 'fetchAndDisplayMenu' function is not requesting and converting data as specified. See intructions`)
      )

      const testSuite = chain(taskOne);
      await auditJavascript(script, testSuite);

      resolve(payload);
    });
  },

  stepThree (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const displayMenuUsesForeachAndCallsUICanInteract = async ({ast, astq}) => {
        try {
          const query = `
          //VariableDeclaration [
            @kind == 'const' &&
            /:declarations VariableDeclarator [
              /:id Identifier [@name == 'displayMenu'] 
              && /:init ArrowFunctionExpression [
                /:body BlockStatement [
                  // CallExpression [
                    /:callee MemberExpression [
                      /:object Identifier [@name == 'menu']
                  && /:property Identifier [@name == 'forEach']
                    ]
                      && /:arguments ArrowFunctionExpression [
                  //CallExpression [
                    /:callee Identifier [@name == 'formatMoney']
                  ]
                ]
                  ]
                  && // CallExpression [
                    /:callee Identifier [@name == 'uiCanInteract']
                  ]
                ]
              ]
            ]
          ]`;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };
      
      const taskOne = audit(displayMenuUsesForeachAndCallsUICanInteract).and(
        haltWithFeedback(`Your 'displayMenu' function is not iterating over 'menu' with forEach and then calling 'uiCanInteract' as specified. See intructions`)
      )

      await auditJavascript(script, chain(taskOne));
      resolve(payload);
    });
  },

  stepFour (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const uiCanInteractHasEventListeners = createAudit(
        queryNamedArrowFnAddsEventsListener,
        {
          name: 'uiCanInteract',
          events: [
            { type: 'click', handler: 'mealChoosen' },
            { type: 'click', handler: 'rateMeal' }
          ]
        }
      );

      const taskOne = audit(uiCanInteractHasEventListeners).and(
        haltWithFeedback(
          `As specified, you need to setup 'click' listeners for certain UI elements in the 'uiCanInteract' function. See instructions`
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

      const destructuresMealChoosenParam = createAudit(queryNamedArrowFnHasParams, {
        name: 'mealChoosen', params: [{
          type: 'ObjectPattern', name: 'target'
        }]
      });

      const hasSelectionLAF = async ({ast, astq}) => {
        const img = select('.menu img');
        const item = img.parentNode;
        item.setAttribute('data-selected', '');

        const failedAsExpected = on(item)
          .ifThe('border-color', asHex, isNotEqual('#333333'))
          .tellMe();

        item.removeAttribute('data-selected');
        return !failedAsExpected;
      };

      const mealChoosenFnCallsCalculateTip = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'mealChoosen'] 
                && /:init ArrowFunctionExpression 
                  /:body BlockStatement //CallExpression /:callee Identifier [
                    @name == 'calculateTip'
                  ] 
               ]
            ]
          `;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const tests = [];
      tests.push(
        audit(destructuresMealChoosenParam).and(
          haltWithFeedback(`Your 'mealChoosen' function does not desctructure its parameter as specified.`)
        )
      );

      tests.push(
        audit(hasSelectionLAF).and(
          haltWithFeedback(`Your 'mealChoosen' function does not implement the right selection behaviour. See intructions.`)
        )
      );

      tests.push(
        audit(mealChoosenFnCallsCalculateTip).and(
          haltWithFeedback(`Your 'mealChoosen' function does not invoke 'calculateTip' as specified.`)
        )
      );

      const testSuite = chain(...tests)
      await auditJavascript(script, testSuite);
      resolve(payload);
    });
  },

  stepTwo (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const getRatingHasParam = createAudit(queryNamedArrowFnHasParams, {
        name: 'getRating', params: [{
          type: 'Identifier', name: 'star'
        }]
      });

      const rateMealHasDestructuredParam = createAudit(queryNamedArrowFnHasParams, {
        name: 'rateMeal', params: [{
          type: 'ObjectPattern', name: 'target'
        }]
      });

      const rateMealDelegatesCorrectly = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'rateMeal'] 
                && /:init ArrowFunctionExpression 
                  /:body BlockStatement 
                  //VariableDeclaration [
                    @kind == 'const'
                && /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'rating'] 
                  && /:init CallExpression [
                    /:callee Identifier [@name == 'getRating'] 
                    && /:arguments Identifier [@name == 'target'] 
                  ]
                ]
                  ]
                  && //CallExpression /:callee Identifier [
                    @name == 'calculateTip'
                  ] 
              ]
            ]
          `;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const rateMealCreatesLAF = async () => {
        const detectRating = ({selectItem}) => {
          try {
            [...selectAll('.actions [data-rate].rated')].forEach(star => star.classList.remove('rated'));

            const item = selectAll('.menu .item')[3];
            if(selectItem === true) {
              item.setAttribute('data-selected', '');
            }
            
            const thirdStar = select(`.actions [data-rate='3']`);
            const fn = rateMeal || noop;
            fn({target: thirdStar});

            const allRated = selectAll('.actions [data-rate].rated');
            const allRatedCount = allRated.length;
            
            const shwoTip = select('h4 .tip');
            if (shwoTip) shwoTip.textContent = '';
            if(selectItem === true) item.removeAttribute('data-selected');
            [...allRated].forEach(star => star.classList.remove('rated'));

            return allRatedCount;
          } catch (error) {
            return -1;
          }
        };

        const ratingWithSelection = detectRating({selectItem: true});
        const ratingWithoutSelection = detectRating({selectItem: false});

        return ratingWithSelection === 3 && ratingWithoutSelection === 0;
      };

      const tests = [];

      tests.push(
        audit(getRatingHasParam).and(
          haltWithFeedback(`Your getRating function does not take in the required parameter`)
        )
      );

      tests.push(
        audit(rateMealHasDestructuredParam).and(
          haltWithFeedback(`Your rateMeal event handler does not have the required parameter structure`)
        )
      );

      tests.push(
        audit(rateMealDelegatesCorrectly).and(
          haltWithFeedback(`Your rateMeal event handler does not call the required functions it needs to do its job!`)
        )
      );

      tests.push(
        audit(rateMealCreatesLAF).and(
          haltWithFeedback(`Your rateMeal function does create the expected rating functionlity & behaviour. See instructions.`)
        )
      );

      const testSuite = chain(...tests)
      await auditJavascript(script, testSuite);
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

      const formatMoneyUsesToLocaleString = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'formatMoney'] 
                && /:init ArrowFunctionExpression 
                  /:body BlockStatement 
                  //MemberExpression /:property Identifier [
                    @name == 'toLocaleString'
                  ]
               ]
            ]
          `;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const formatMoneyConvertsToCurrencyString = async ({ast, astq}) => {
        try {
          const fn = formatMoney || noop;
          const tip1 = fn(50);
          const tip2 = fn(1000);

          return tip1 === '$50.00' && tip2 === '$1,000.00';
        } catch (queryError) {}
      };

      const tipWithFnCallsFormatMoney = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'tipWith'] 
                && /:init ArrowFunctionExpression 
                  /:body BlockStatement 
                  //CallExpression [
                    /:callee Identifier [@name == 'formatMoney']
                && /:arguments Identifier [@name == 'tip']
                  ]
              ]
            ]
          `;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const tests = [];

      tests.push(
        audit(formatMoneyUsesToLocaleString).and(
          haltWithFeedback(`You are not using toLocalString in formatMoney to format a price figure into currency `)
        )
      );

      tests.push(
        audit(formatMoneyConvertsToCurrencyString).and(
          haltWithFeedback(`Your formatMoney function is not formating or converting into currency correctly `)
        )
      );

      tests.push(
        audit(tipWithFnCallsFormatMoney).and(
          haltWithFeedback(`Your tapWith function is not delagating to formatMoney`)
        )
      );
      
      const testSuite = chain(...tests)
      await auditJavascript(script, testSuite);

      resolve(payload);
    });
  },

  stepTwo (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const calculateTipHasRequiredStructure = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
                @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'calculateTip'] 
                  && /:init ArrowFunctionExpression 
                    /:body BlockStatement [
                      //VariableDeclarator [
                        /:id Identifier [@name == 'meal'] 
                        && /:init CallExpression /MemberExpression [
                          /:object Identifier [@name == 'menu'] 
                          && /:property Identifier [@name == 'find'] 
                        ]
                      ]
                      && //CallExpression /:callee Identifier [@name == 'tipWith'] 
                    ]
                ]
            ]
          `;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const calculateTipsCorrectly = async () => {
        const myCalculateTip = () => {
          const selected = document.querySelector('[data-selected]');
          const mealId = selected.getAttribute('data-meal-id');
          const meal = menu.find(m => m.id === mealId);
          
          if(!meal) return;
          
          const ratings = selectAll('.rated');
          
          if(ratings.length <= 0) return;
          
          const satisfaction = [...ratings].reduce((max, star) => {
            return Math.max(max, getRating(star));
          }, 0);
          
          if(satisfaction < 3) return;
          
          const tip = parseFloat( (satisfaction / 50 ) * meal.price ).toFixed(1);
          return tip;
        };
      
        const myFormatMoney = (figure) => {
          return figure.toLocaleString('en-US', {
            style: 'currency', currency: 'USD'
          });
        };

        const rateMealAndCalculateTip = async (mealIndex) => {
          try {
            const allRated = selectAll('.actions [data-rate].rated');
            [...allRated].forEach(star => star.classList.remove('rated'));

            const item = selectAll('.menu .item')[mealIndex];
            item.setAttribute('data-selected', '');
            
            const thirdStar = select(`.actions [data-rate='3']`);
            const rateIt = rateMeal;
            rateIt({target: thirdStar});

            const tipIt = calculateTip;
            const tip = tipIt();

            const formatIt = formatMoney;
            const formated = formatIt(tip);

            const myTip = myCalculateTip();
            const myFormat = myFormatMoney(myTip);
            
            const shwoTip = select('h4 .tip');
            
            shwoTip.textContent = '';
            item.removeAttribute('data-selected');
            [...allRated].forEach(star => star.classList.remove('rated'));

            return (myTip === tip) && (myFormat === formated);
          } catch (error) {}
        };

        const take1 = await rateMealAndCalculateTip(2);
        const take2 = await rateMealAndCalculateTip(3);
        
        return  take1 && take2;
      };

      const tests = [];

      tests.push(
        audit(calculateTipHasRequiredStructure).and(
          haltWithFeedback(`Your calculateTip function does not use the .find function or call the tipWith function. See instructions`)
        )
      );

      tests.push(
        audit(calculateTipsCorrectly).and(
          haltWithFeedback(`Your calculateTip function calcultates tips incorrectly. At this rate, you will be tipping attendants wrongly!`)
        )
      );

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const testSuite = chain(...tests)
      await auditJavascript(script, testSuite);
      resolve(payload);
      
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
