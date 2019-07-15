const challenges = [];

const challengeOne = {
  stepOne (payload) {
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const haltWithFeedback = haltAuditWith(reject);

      failedAsExpected = on('body')
        .ifThe('background-color', asHex, isNotEqual('#ffffff'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(
          `The BODY element should have a WHITE background color.`
        );
      }

      const dataCartInfo = select('[data-cart-info]');
      if (!dataCartInfo) {
        haltWithFeedback(
          `You need to create a DIV having "data-cart-info" as an attribute `
        );
      }

      const heading = select('[data-cart-info] .mdc-typography--headline4');
      if (!heading) {
        haltWithFeedback(
          `As specified, you need to create a HEADING with a "mdc-typography--headline4" class`
        );
      }

      const spans = selectAll('.mdc-typography--headline4 span');
      if (spans.length !== 2) {
        haltWithFeedback(
          `You need to create two SPAN elements within the "mdc-typography--headline4" HEADING`
        );
      } else {
        const [first, second] = [...spans];
        if (
          !first.classList.contains('material-icons') ||
          trim(first.textContent) !== 'shopping_cart' ||
          !second.hasAttribute('data-bill')
        ) {
          haltWithFeedback(
            `Your SPAN elements within the "mdc-typography--headline4" HEADING are not as specified`
          );
        }
      }

      const dataCreditCard = select('[data-credit-card].mdc-card');
      if (!dataCreditCard) {
        haltWithFeedback(
          `You need to create a DIV having "data-credit-card" as an attribute`
        );
      }

      const dataCreditCardInner = select(
        '[data-credit-card].mdc-card .mdc-card__primary-action'
      );
      if (!dataCreditCardInner) {
        haltWithFeedback(
          `You need a ".mdc-card__primary-action" DIV within the "data-credit-card" DIV`
        );
      }

      const img = select('.mdc-card__primary-action [data-card-type]');
      if (
        !img ||
        !img.src ||
        img.src.indexOf('placehold.it/120x60') === -1
      ) {
        haltWithFeedback(
          `You need to create the IMAGE element with the specified attributes`
        );
      }

      const dataCreditDigits = select('[data-cc-digits]');
      if (!dataCreditDigits) {
        haltWithFeedback(
          `You need to create a DIV having "data-cc-digits" as an attribute`
        );
      }

      const digitsFields = selectAll('[data-cc-digits] input[type="text"]');
      if (
        digitsFields.length !== 4 ||
        ![...digitsFields].every(f => {
          return (
            f.hasAttribute('size') &&
            parseInt(f.getAttribute('size')) === 4 &&
            f.getAttribute('placeholder') === '----'
          );
        })
      ) {
        haltWithFeedback(
          `You need to create the specified INPUT elements within the "data-cc-digits" DIV`
        );
      }

      const dataCCInfor = selectAll('[data-cc-info]');
      if (!dataCCInfor) {
        haltWithFeedback(
          `As specfied, you need to create a DIV having "data-cc-info" as an attribute`
        );
      }

      const infoFields = selectAll('[data-cc-info] input[type="text"]');
      if (infoFields.length !== 2) {
        haltWithFeedback(
          'You need to create exactly 2 INPUT elements within the "data-cc-info" DIV. See instructions'
        );
      }

      const [name, expiry] = [...infoFields];
      if (
        !name.hasAttribute('size') ||
        name.getAttribute('placeholder') !== 'Name Surname' ||
        expiry.getAttribute('placeholder') !== 'MM/YY'
      ) {
        haltWithFeedback(
          `You need to create the specified INPUT elements within the "data-cc-info" DIV`
        );
      }

      const btn = select('[data-pay-btn].mdc-button');
      if (!btn || (trim(btn.textContent) !== 'Pay & Checkout Now' && trim(btn.textContent) !== 'Pay &amp; Checkout Now')) {
        haltWithFeedback(
          `As specified, create a BUTTON with a "data-pay-btn" attribute and the required content. See instructions`
        );
      }

      resolve(payload);
    });
  },

  stepTwo (payload) {
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const haltWithFeedback = haltAuditWith(reject);

      const [cart, bill] = [...selectAll('[data-cart-info] span')];
      const cartFailed = on(cart)
        .ifThe('display', asIs, isNotEqual('inline-block'))
        .ifThe('vertical-align', asIs, isNotEqual('middle'))
        .ifThe('font-size', asPixelsToInt, isNotEqual(150))
        .tellMe();

      const billFailed = on(bill)
        .ifThe('display', asIs, isNotEqual('inline-block'))
        .ifThe('vertical-align', asIs, isNotEqual('middle'))
        .tellMe();

      if (cartFailed || billFailed) {
        haltWithFeedback(
          'The SPAN elements within the "data-cart-info" DIV do not have the required CSS style'
        );
      }

      failedAsExpected = on('[data-credit-card]')
        .ifThe('width', asPixelsToInt, isNotEqual(435))
        .ifThe('min-height', asPixelsToInt, isNotEqual(240))
        .ifThe('border-radius', asIs, isNotEqual('10px'))
        .ifThe('background-color', asHex, isNotEqual('#5d6874'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(
          'The "data-credit-card" DIV does not have the reauired CSS style'
        );
      }

      failedAsExpected = on('[data-card-type]')
        .ifThe('display', asIs, isNotEqual('block'))
        .ifThe('width', asPixelsToInt, isNotEqual(120))
        .ifThe('height', asPixelsToInt, isNotEqual(60))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(
          'The "data-card-type" IMAGE does not have the specified CSS'
        );
      }

      failedAsExpected = on('[data-cc-digits]')
        .ifThe('margin-top', asPixelsToInt, isNotEqual(32))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(
          'The "data-cc-digits" DIV does not have the specified CSS for margin.'
        );
      }

      const digitFields = selectAll('[data-cc-digits] input[type="text"]');
      failedAsExpected = [...digitFields].find(f => {
        return on(f)
          .ifThe('color', asHex, isNotEqual('#ffffff'))
          .ifThe('font-size', asPixelsToInt, isNotEqual(32))
          .ifThe('line-height', asPixelsToInt, isNotEqual(64))
          .ifThe('border', asIs, isNotEqual('0px none rgb(255, 255, 255)'))
          .ifThe('background-color', asIs, isNotEqual('rgba(0, 0, 0, 0)'))
          .ifThe('margin-right', asPixelsToInt, isNotEqual(16))
          .tellMe();
      });

      if (failedAsExpected) {
        haltWithFeedback(
          'One or more of the INPUT elements in the "data-cc-digits" DIV does not have the specified CSS.'
        );
      }

      failedAsExpected = on('[data-cc-info]')
        .ifThe('margin-top', asPixelsToInt, isNotEqual(16))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(
          'The "data-cc-info" DIV does not have the specified CSS for margin.'
        );
      }

      const infoFields = selectAll('[data-cc-info] input[type="text"]');
      failedAsExpected = [...infoFields].find(f => {
        return on(f)
          .ifThe('color', asHex, isNotEqual('#ffffff'))
          .ifThe('font-size', asPixelsToFloat, isNotEqual(19.2))
          .ifThe('border', asIs, isNotEqual('0px none rgb(255, 255, 255)'))
          .ifThe('background-color', asIs, isNotEqual('rgba(0, 0, 0, 0)'))
          .tellMe();
      });

      const expiryFailed = on(infoFields[1])
        .ifThe('padding-right', asPixelsToInt, isNotEqual(10))
        .ifThe('float', asIs, isNotEqual('right'))
        .tellMe();

      if (failedAsExpected || expiryFailed) {
        haltWithFeedback(
          'One or all of the INPUT elements in the "data-cc-info" DIV does not have the specified CSS.'
        );
      }

      failedAsExpected = on('[data-pay-btn]')
        .ifThe('position', asIs, isNotEqual('fixed'))
        .ifThe('width', asPixelsToInt, isNotEqual(324))
        .ifThe('bottom', asPixelsToInt, isNotEqual(20))
        .ifThe('border', asIs, isNotEqual('1px solid rgb(98, 0, 238)'))
        .tellMe();

      if (failedAsExpected) {
        haltWithFeedback(
          'The "data-pay-btn" BUTTON element does not have the specified CSS.'
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

      const declaresAppStateObject = createAudit(queryExpressionDeclaration, {
        name: 'appState',
        exprType: 'ObjectExpression'
      });

      const declaresFormatAsMoneyFn = createAudit(queryNamedArrowFnHasParams, {
        name: 'formatAsMoney', params: ['amount', 'buyerCountry']
      });

      const declaresDetectCardTypeFn = createAudit(queryNamedArrowFnHasParams, {
        name: 'detectCardType', 
        params: [{
          type: 'ObjectPattern', name: 'target'
        }]
      });

      const declaresValidateCardExpiryDateFn = createAudit(queryNamedArrowFnHasParams, {
        name: 'validateCardExpiryDate', 
        params: [{
          type: 'ObjectPattern', name: 'target'
        }]
      });

      const declaresValidateCardHolderNameFn = createAudit(queryNamedArrowFnHasParams, {
        name: 'validateCardHolderName', 
        params: [{
          type: 'ObjectPattern', name: 'target'
        }]
      });

      const declaresUiCanInteractFn = createAudit(queryArrowFunction, {
        name: 'uiCanInteract'
      });

      const declaresDisplayCartTotalFn = createAudit(queryNamedArrowFnHasParams, {
        name: 'displayCartTotal', 
        params: [{
          type: 'ObjectPattern', name: 'results'
        }]
      });

      const tests = [];
      tests.push(
        audit(declaresAppStateObject).and(
          haltWithFeedback(
            `You have not delcared "appState" as specified. See instructions`
          )
        )
      );

      tests.push(
        audit(declaresFormatAsMoneyFn).and(
          haltWithFeedback(
            `You have not declared "formatAsMoney" as specified. See instructions`
          )
        )
      );

      tests.push(
        audit(declaresDetectCardTypeFn).and(
          haltWithFeedback(
            `You have not declared "detectCardType" as specified. See instructions`
          )
        )
      );

      tests.push(
        audit(declaresValidateCardExpiryDateFn).and(
          haltWithFeedback(
            `You have not declared "validateCardExpiryDate" as specified. See instructions`
          )
        )
      );

      tests.push(
        audit(declaresValidateCardHolderNameFn).and(
          haltWithFeedback(
            `You have not declared "validateCardHolderName" as specified. See instructions`
          )
        )
      );

      tests.push(
        audit(declaresUiCanInteractFn).and(
          haltWithFeedback(
            `You have not declared "uiCanInteract" as specified. See instructions`
          )
        )
      );

      tests.push(
        audit(declaresDisplayCartTotalFn).and(
          haltWithFeedback(
            `You have not declared "displayCartTotal" as specified. See instructions`
          )
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

      const fetchBillFnHasAssignment = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'fetchBill'] 
                  && /:init ArrowFunctionExpression [
                      /:body BlockStatement [
                        //VariableDeclaration [
                          @kind == 'const' &&
                          /:declarations VariableDeclarator [
                            /:id Identifier [@name == 'api']
                            && /:init Literal [@value == 'https://randomapi.com/api/006b08a801d82d0c9824dcfdfdfa3b3c']
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

      const fetchBillAndDisplayCartTotal = async ({ast, astq}) => {
        try{
          const query = `
          //VariableDeclaration [
            @kind == 'const' &&
            /:declarations VariableDeclarator [
              /:id Identifier [@name == 'fetchBill'] 
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
                          /:callee Identifier [@name == 'displayCartTotal']
                          && /:arguments Identifier [@name == 'data']
                        ]
                      ]

                      || /:arguments Identifier [@name == 'displayCartTotal']
                  ]
                ]
              ]
            ]
          ]`;

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
                              /:callee Identifier [@name == 'fetchBill']
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
        audit(fetchBillFnHasAssignment).and(
          haltWithFeedback(
            `You have not declared "fetchBill" and assigned the correct URL to "api". See instructions`
          )
        )
      );

      tests.push(
        audit(fetchBillAndDisplayCartTotal).and(
          haltWithFeedback(
            `You are not correctly using "fetchBill" to make a HTTP request, convert the response to JSON and then call "displayCartTotal" with the data. See instructions`
          )
        )
      );

      tests.push(
        audit(startAppDelegatesCorrectly).and(
          haltWithFeedback(
            `You are not invoking "fetchBill" from the "startApp" function to get the app running?. See instructions`
          )
        )
      );

      const testSuite = chain(...tests);
      await auditJavascript(script, testSuite);

      resolve(payload);
    });
  },

  stepThree (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const displayCartTotalDestructuresData = async ({ast, astq}) => {
        try {
          const query = `
           //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'displayCartTotal'] 
                && /:init ArrowFunctionExpression [
                  /:body BlockStatement [
                      //VariableDeclarator [
                          /:id ArrayPattern //Identifier [@name == 'data']
                          && /:init Identifier [@name == 'results']
                      ]
                      && //VariableDeclarator [
                          /:id ObjectPattern [
                            //Identifier [@name == 'itemsInCart']
                            && //Identifier [@name == 'buyerCountry']
                          ]
                        && /:init Identifier [@name == 'data']
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

      const canFormatAsMoney = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'formatAsMoney'] 
                  && /:init ArrowFunctionExpression [
                      /:body BlockStatement [
                        // CallExpression /:callee MemberExpression [
                          /:object Identifier [@name == 'amount']
                          && /:property Identifier [@name == 'toLocaleString']
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

      const setsAppStateAndCallsUiCanInteract = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'displayCartTotal'] 
                && /:init ArrowFunctionExpression [
                  /:body BlockStatement [
                    //AssignmentExpression [
                        /:left MemberExpression [
                          /:object Identifier [@name == 'appState']
                          && /:property Identifier [@name == 'items']
                        ] &&
                        /:right Identifier [@name == 'itemsInCart']
                      ] &&
                          
                      //AssignmentExpression [
                        /:left MemberExpression [
                          /:object Identifier [@name == 'appState']
                          && /:property Identifier [@name == 'country']
                        ]
                        && /:right Identifier [@name == 'buyerCountry']
                      ] &&
                          
                     //AssignmentExpression [
                        /:left MemberExpression [
                          /:object Identifier [@name == 'appState']
                          && /:property Identifier [@name == 'billFormatted']
                        ]
                        && /:right CallExpression /:callee Identifier [@name == 'formatAsMoney']
                      ] &&
                        
                      //AssignmentExpression [
                        /:left MemberExpression [
                          /:property Identifier [@name == 'textContent']
                        ]
                        && /:right MemberExpression [
                        /:object Identifier [@name == 'appState'] &&
                          /:property Identifier [@name == 'billFormatted']
                        ]
                      ] &&
                      // CallExpression /:callee Identifier [@name == 'uiCanInteract']
                    ]
                  ]
              ]
            ]
          `;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const calculatesBillWithReduce = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
              /:declarations VariableDeclarator [
                /:id Identifier [@name == 'displayCartTotal'] 
                && /:init ArrowFunctionExpression [
                  /:body BlockStatement [
                     //AssignmentExpression [
                        /:left MemberExpression [
                          /:object Identifier [@name == 'appState'] &&
                          /:property Identifier [@name == 'bill']
                        ]
                        && /:right CallExpression /:callee MemberExpression [
                          /:object Identifier [@name == 'itemsInCart'] &&
                          /:property Identifier [@name == 'reduce']
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

      const tests = [];
      tests.push(
        audit(displayCartTotalDestructuresData).and(
          haltWithFeedback(
            `In "displayCartTotal", you are not destructuring the "results" parameter to "data" and also destructuring that to get "itemsInCart" and "buyerCountry"?. See instructions`
          )
        )
      );

      tests.push(
        audit(canFormatAsMoney).and(
          haltWithFeedback(
            `Your "formatAsMoney" function is not impemented as specified. See instructions`
          )
        )
      );

      tests.push(
        audit(setsAppStateAndCallsUiCanInteract).and(
          haltWithFeedback(
            `In "displayCartTotal", you are required to assign a number of data to "appState" and then invoke "uiCanInteract". See instructions`
          )
        )
      );

      tests.push(
        audit(calculatesBillWithReduce).and(
          haltWithFeedback(
            `In "displayCartTotal", given the items the user bought, you are to derive the total bill with the ".reduce" function and assign it to "appState.bill". See instructions`
          )
        )
      );

      const testSuite = chain(...tests);
      await auditJavascript(script, testSuite);

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

      const usesOnlySelectorAPI = async ({ast, astq}) => {
        try {
          const query = `
            // CallExpression /:callee MemberExpression [
                /:property Identifier [@name == 'getElementById'] ||
                /:property Identifier [@name == 'getElementsByName'] ||
                /:property Identifier [@name == 'getElementsByTagName']
            ]
          `;

          const [node] = astq.query(ast, query);
          return node === undefined;
        } catch (queryError) {}
      };

      const flagIfInvalidFn = createAudit(queryNamedArrowFnHasParams, {
        name: 'flagIfInvalid', params: ['field', 'isValid']
      });

      const expiryDateFormatIsValidFn = createAudit(queryNamedArrowFnHasParams, {
        name: 'expiryDateFormatIsValid', params: ['target']
      });

      const expiryDateValidatorDelegatesAndReturns = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'validateCardExpiryDate'] 
                  && /:init ArrowFunctionExpression [
                      /:body BlockStatement [
                        // CallExpression /:callee Identifier [@name == 'expiryDateFormatIsValid'] 
                        && // CallExpression [
                          /:callee Identifier [@name == 'flagIfInvalid'] 
                        ]
                        && // ReturnStatement
                    ]
                ]
              ]
            ]
          `;

          const [node] = astq.query(ast, query);
          return node !== undefined;
        } catch (queryError) {}
      };

      const nameValidatorDelegatesAndReturns = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'validateCardHolderName'] 
                  && /:init ArrowFunctionExpression [
                      /:body BlockStatement [
                        // CallExpression [
                          /:callee Identifier [@name == 'flagIfInvalid'] 
                        ]
                        && // ReturnStatement
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
        audit(flagIfInvalidFn).and(
          haltWithFeedback(
            `You need to create a "flagIfInvalid" function with certain parameters. See instructions`
          )
        )
      );

      tests.push(
        audit(expiryDateFormatIsValidFn).and(
          haltWithFeedback(
            `You need to create a "expiryDateFormatIsValid" function with certain parameters. See instructions`
          )
        )
      );

      tests.push(
        audit(expiryDateValidatorDelegatesAndReturns).and(
          haltWithFeedback(
            `Your "validateCardExpiryDate" function does not delegate to the specified functions and then return a value. See instructions`
          )
        )
      );

      tests.push(
        audit(nameValidatorDelegatesAndReturns).and(
          haltWithFeedback(
            `Your "validateCardHolderName" function does not delegate to the specified functions and then return a value. See instructions`
          )
        )
      );

      tests.push(
        audit(usesOnlySelectorAPI).and(
          haltWithFeedback(
            `You seem to be using at least one form of the "getElement...." DOM APIs. You are required to only use the DOM Selector API`
          )
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

      const uiCanInteractHasEventListeners = createAudit(
        queryNamedArrowFnAddsEventsListener,
        {
          name: 'uiCanInteract',
          events: [
            { type: 'blur', handler: 'detectCardType' },
            { type: 'blur', handler: 'validateCardHolderName' },
            { type: 'blur', handler: 'validateCardExpiryDate' },
            { type: 'click', handler: 'validateCardNumber' }
          ]
        }
      );

      const uiCanInteractAssignsFocus = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'uiCanInteract'] 
                  && /:init ArrowFunctionExpression [
                      /:body BlockStatement [
                        // CallExpression [
                          /:callee MemberExpression /:property Identifier [@name == 'focus'] 
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
        audit(uiCanInteractHasEventListeners).and(
          haltWithFeedback(
            `As specified, you need to setup event listeners for certain UI elements in the 'uiCanInteract' function. See instructions for more details`
          )
        )
      );

      tests.push(
        audit(uiCanInteractAssignsFocus).and(
          haltWithFeedback(
            `Your 'uiCanInteract' function needs to give focus to a certain input field. See instructions for more details`
          )
        )
      );

      const testSuite = chain(...tests);
      await auditJavascript(script, testSuite);

      resolve(payload);
    });
  },

  stepThree (payload) {
    return new Promise(async (resolve, reject) => {
      const { script } = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const validateCardNumberFn = createAudit(queryArrowFunction, {
        name: 'validateCardNumber'
      });

      const detectsCardTypeAndSetsImage = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'detectCardType'] 
                  && /:init ArrowFunctionExpression [
                      /:body BlockStatement [
                        // AssignmentExpression 
                          /:left MemberExpression 
                          /:property Identifier [@name == 'src']
                      ]
                 ]
              ]
            ]
          `;

          const [node] = astq.query(ast, query);
          if(node !== undefined) {
            const logo = select('[data-card-type]');
            const currentSrc = logo.src;

            const input = select('[data-cc-digits] input:nth-child(1)');
            const currentValue = input.value;

            const cards = {
              'is-visa': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAABkCAYAAAD32uk+AAAACXBIWXMAAAsTAAALEwEAmpwYAABO',
              'is-mastercard': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAABkCAYAAAAWlKtGAAABfGlDQ1BJQ0MgUHJvZmlsZQAAKJGlkL9LQlEUx79qYZThkENDw4OkITTMltpSBykcxAyyWt67Pn+APi'
            };

            let cardCmpCls = '';
            const cardCmp = select('[data-credit-card]');
            if(cardCmp.classList.contains('is-visa')) cardCmpCls = 'is-visa';
            if(cardCmp.classList.contains('is-mastercard')) cardCmpCls = 'is-mastercard';

            const checkCard = (cardType, firstFourDigits) => {
              input.value = `${firstFourDigits}`;
              input.setAttribute('value', `${firstFourDigits}`);

              const type = detectCardType({target: input});
              const logoSrc = select('[data-card-type]').src;

              return cardType === type && 
                logoSrc.startsWith(cards[type]) && 
                select('[data-credit-card]').classList.contains(type);
            };

            const forVisa = checkCard('is-visa', 4357);
            const forMstCard = checkCard('is-mastercard', 5217);
            
            input.value = currentValue;
            input.setAttribute('value', currentValue);
            logo.src = currentSrc;
            cardCmp.classList.remove('is-visa', 'is-mastercard');
            if(cardCmpCls !== '') cardCmp.classList.add(cardCmpCls);

            return forVisa && forMstCard;
          }

          return false;
        } catch (queryError) {}
      };

      const tests = [];
      tests.push(
        audit(detectsCardTypeAndSetsImage).and(
          haltWithFeedback(
            `"detectCardType" is failing at its detective job! It can't correctly detect the card type and display the appropriate card logo?`
          )
        )
      );

      tests.push(
        audit(validateCardNumberFn).and(
          haltWithFeedback(
            `You need to create a "validateCardNumber". See instructions`
          )
        )
      );

      const testSuite = chain(...tests);
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

      const validateWithLuhnFn = createAudit(queryArrowFunction, {
        name: 'validateWithLuhn'
      });

      const checkLuhnImplementation = () => {
        const validCCs = [
          '4556372551434601',
          '4916337563926287',
          '4716361721613449',
          '4539818898404311',
          '4929416075118388',
          '5130752529459529',
          '5250457226640843',
          '5330664490375584',
          '5241343263959571',
          '5250445524664938'
        ];

        const invalidCCs = [
          '45563725554346010',
          '4916339563926287',
          '471636172421613449',
          '45398198404311',
          '4929416775118388',
          '5130752829459529',
          '5250457526640843',
          '3330664490375584',
          '7241343263959571',
          '62504455246654938'
        ];

        const bulkCheck = ccs => {
          return ccs.map(cc => {
            const digits = `${cc}`.split('').map(digit => parseInt(digit, 10));
            return validateWithLuhn(digits);
          });
        };

        return bulkCheck(validCCs).every(check => check === true) 
          && bulkCheck(invalidCCs).every(check => check === false)
      };

      const tests = [];
      tests.push(
        audit(validateWithLuhnFn).and(
          haltWithFeedback(
            `You need to create a "validateWithLuhn" function that will check if the credit card numbers are valid. See instructions.`
          )
        )
      );

      tests.push(
        audit(checkLuhnImplementation).and(
          haltWithFeedback(
            `Your "validateWithLuhn" function is not correctly validating card numbers as specified. See instructions.`
          )
        )
      );

      const testSuite = chain(...tests);
      await auditJavascript(script, testSuite);

      resolve(payload);
    });
  },

  stepTwo (payload) {
    return new Promise(async (resolve, reject) => {
      const {script} = payload;
      const haltWithFeedback = deferAuditHaltWith(reject);

      const validateCardNumberFn = async ({ast, astq}) => {
        try {
          const query = `
            //VariableDeclaration [
              @kind == 'const' &&
                /:declarations VariableDeclarator [
                  /:id Identifier [@name == 'validateCardNumber'] 
                  && /:init ArrowFunctionExpression [
                      /:body BlockStatement [
                        // CallExpression [
                          /:callee Identifier [@name == 'validateWithLuhn']
                          && /:arguments Identifier
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

      const checkValidateCardNumberFn = async () => {
        const validCCs = [
          '4556372551434601',
          '4916337563926287',
          '4716361721613449',
          '4539818898404311',
          '4929416075118388',
          '5130752529459529',
          '5250457226640843',
          '5330664490375584',
          '5241343263959571',
          '5250445524664938'
        ];

        const invalidCCs = [
          '45563725554346010',
          '4916339563926287',
          '471636172421613449',
          '45398198404311',
          '4929416775118388',
          '5130752829459529',
          '5250457526640843',
          '3330664490375584',
          '7241343263959571',
          '62504455246654938'
        ];

        const bulkCheck = ccs => {
          return ccs.map(cc => {
            const numbers = `${cc}`.split('').map(digit => parseInt(digit, 10));
            const defaults = [];
            const fields = [...selectAll('[data-cc-digits] input')];

            let fieldCursor = 0;
            for(let i = 0; i < 15; i += 4) {
              defaults.push(fields[fieldCursor].value);

              const value = numbers.join('').substr(i, 4);
              fields[fieldCursor].value = value;
              fields[fieldCursor].setAttribute('value', value);
              fieldCursor += 1;
            }

            const div = select('[data-cc-digits]');
            const hasCls = div.classList.contains('is-invalid');
            div.classList.remove('is-invalid');

            const isValid = validateCardNumber();
            const hasIsInvalidCls = select('[data-cc-digits]').classList.contains('is-invalid');

            fields.forEach((f, i) => {
              f.value = defaults[i];
              f.setAttribute('value', defaults[i]);
            });

            if(hasCls) div.classList.add('is-invalid');

            return {isValid, hasIsInvalidCls};
          });
        };

        return bulkCheck(validCCs).every(({isValid, hasIsInvalidCls}) => isValid === true && hasIsInvalidCls === false ) 
          && bulkCheck(invalidCCs).every(({isValid, hasIsInvalidCls}) => isValid === false && hasIsInvalidCls === true)
      };

      const tests = [];
      tests.push(
        audit(validateCardNumberFn).and(
          haltWithFeedback(
            `Make sure your "validateCardNumber" function is using the "validateWithLuhn" function to do its job. See instructions.`
          )
        )
      );

      tests.push(
        audit(checkValidateCardNumberFn).and(
          haltWithFeedback(
            `Your "validateCardNumber" function is not correctly indicating valid or invalid card numbers. See instructions.`
          )
        )
      );

      const testSuite = chain(...tests);
      await auditJavascript(script, testSuite);

      resolve(payload);
    });
  },

  stepThree (payload) {
    return new Promise(async (resolve, reject) => {
      const haltWithFeedback = haltAuditWith(reject);

      const calculateBill = ([data]) => {
        const {itemsInCart} = data;
        return itemsInCart.reduce((total, { price, qty }) => {
          return total + (price * qty);
        }, 0);
      };

      const formatBill = (amount, buyerCountry) => {
        const country =
          countries.find(c => c.country === buyerCountry) || countries[0];
        return amount.toLocaleString(`en-${country.code}`, {
          style: "currency",
          currency: country.currency
        });
      };

      const checkCardExpiryDate = () => {
        const checkDate = ({date, validity}) => {
          let field = select('[data-cc-info] input:nth-child(2)');
          const value = field.value;

          field.value = date;
          field.setAttribute('value', date);
          const isValid = validateCardExpiryDate({target: field});

          field = select('[data-cc-info] input:nth-child(2)');
          field.value = value;
          field.setAttribute('value', value);

          return validity === false ? (isValid === validity && field.classList.contains('is-invalid')) : (isValid === validity);
        };

        return checkDate({date: '10/20', validity: true})
          && checkDate({date: '10/18', validity: false})
          && checkDate({date: '1/10/2019', validity: false})
          && checkDate({date: '10/1/2020', validity: false})
      };

      const checkCardHolderName = () => {
        const checkName = ({name, validity}) => {
          let field = select('[data-cc-info] input:nth-child(1)');
          const value = field.value;

          field.value = name;
          field.setAttribute('value', name);
          const isValid = validateCardHolderName({target: field});

          field = select('[data-cc-info] input:nth-child(1)');
          field.value = value;
          field.setAttribute('value', value);

          return validity === false ? (isValid === validity && field.classList.contains('is-invalid')) : (isValid === validity);
        };

        return checkName({name: 'Odili Charles', validity: true})
          && checkName({name: 'Odili', validity: false})
          && checkName({name: 'Odili Charles Opute', validity: false})
      };

      const checkAppState = ({results}) => {
        if(appState.bill !== calculateBill(results)) {
          haltWithFeedback(`You are not currectly calculating the user's total bill. See instructions and review your code`);
        }

        if(appState.billFormatted !== formatBill(appState.bill, appState.country)) {
          haltWithFeedback(`You are not currectly formatting the user's total bill. See instructions and review your code`);
        }

        if(!checkCardHolderName()) {
          haltWithFeedback(`You are not correctly validating the card holder's name and marking incorrect entries as invalid?`);
        }

        if(!checkCardExpiryDate()) {
          haltWithFeedback(`You are not correctly validating the card's expiry date and marking incorrect entries as invalid?`);
        }
      };

      if(navigator.serviceWorker && navigator.serviceWorker.controller) {
        const callReturned = async ({data}) => {
          const {type, apiResponse} = data;
          if('api-returned' === type && apiResponse) {
            setTimeout(() => {
              checkAppState(apiResponse);
              resolve(payload);
            }, 500);
          }
        };

        navigator.serviceWorker.addEventListener('message', callReturned, {
          once: true
        });
      } else {
        console.warn('No SW, manually checking API response handling ...');
        setTimeout(() => {
          const response = {
            results: [{
              buyerCountry: 'Nigeria',
              itemsInCart: [{
                name: 'Matooke',
                price: 136,
                qty: 1
              }, {
                name: 'Nyama Choma',
                price: 135,
                qty: 3
              }]
            }]
          };
          displayCartTotal(response);
          checkAppState(response);
          resolve(payload);
        }, 2000);
      }

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
