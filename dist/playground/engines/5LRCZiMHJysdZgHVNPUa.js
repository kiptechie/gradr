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
        !img.src.startsWith('http://lorempixel.com/120/50/blank')
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
      if (!btn || trim(btn.textContent) !== 'Pay & Checkout Now') {
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
        .ifThe('min-height', asPixelsToInt, isNotEqual(240), { debug: true })
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
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const { script } = payload;
      const haltWithFeedback = haltAuditWith(reject);

      resolve(payload);
    });
  }
};
challenges.push(challengeTwo);

const challengeThree = {
  stepOne (payload) {
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const { script } = payload;
      const haltWithFeedback = haltAuditWith(reject);

      resolve(payload);
    });
  }
};
challenges.push(challengeThree);

const challengeFour = {
  stepOne (payload) {
    return new Promise((resolve, reject) => {
      let failedAsExpected = false;
      const { script } = payload;
      const haltWithFeedback = haltAuditWith(reject);

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
