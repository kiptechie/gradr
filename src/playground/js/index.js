import firebase from 'firebase/app';

import {
  trim,
  goTo,
  select,
  isAfterKickoffTime,
  loadStylesAndScripts,
  handleWindowPopState
} from '../../commons/js/utils.js';

import {
  importPlayground,
  importFirebaseInitializer
} from './module-manager.js';

let toast;
let testId;
let appUser;
let provider;
let uiIsBuilt = false;

const invalidURLMsg = 'Awwww Snaaap :( Your Assesment URL Is Invalid.';
const testNotYetOpenMsg = `I see you're an early bird. However, this assessment is not yet open.`;

const notify = msg => {
  if (!toast || trim(msg) === '') return;

  select('#intro-toast .mdc-snackbar__label').textContent = msg;
  toast.open();
};

const signIn = () => {
  if (!provider) return;

  firebase
    .auth()
    .signInWithPopup(provider)
    .catch(error => {
      const { code, message } = error;
      if(code && code.indexOf('account-exists-with-different-credential')) {
        notify('An account already exists with the same email address but different sign-in credentials. Make sure you are using the intended Github account');
      }

      if(code && code.indexOf('network-request-failed')) {
        notify(
          'Potential network error. Please refresh and try again!'
        );
      }

      ga('send', {
        hitType: 'event',
        nonInteraction: true,
        eventValue: `${message}`,
        eventCategory: 'Playground',
        eventAction: 'signin-failure'
      });

    });
};

const setupSignIn = () => {
  if (uiIsBuilt === true) return;

  const signInBtn = select(`[data-view='home'] button`);
  if (signInBtn) {
    signInBtn.addEventListener('click', signIn);
    signInBtn.classList.add('live');
  }
  uiIsBuilt = true;
};

const fetchImpliedAssessment = () => {
  notify('Still busy, please wait ...');
  const assessmentId = testId
    .split('')
    .reverse()
    .join('');

  return firebase
    .firestore()
    .collection('assessments')
    .doc(assessmentId)
    .get();
};

const assessmentIsLive = (assessmentDoc) => {
  const { startingAt } = assessmentDoc.data();
  if (isAfterKickoffTime({ startingAt })) return true;

  const msg = `${testNotYetOpenMsg} Do check back on ${new Date(startingAt)}`;
  notify(testNotYetOpenMsg);
  select(`[data-view='intro'] h3.mdc-typography--headline5`).textContent = msg;

  return false;
};

const enterPlayground = async (assessmentDoc) => {
  notify('Busy, loading playground resources  ...');

  const playground = await importPlayground();
  playground.enter({ user: appUser, test: testId, assessmentDoc});
};

const enterHome = (testId) => {
  // select('body').removeAttribute('data-auth');
  goTo('home', { test: testId });
};

const initServiceBot = () => loadStylesAndScripts('/engines/service-bot.js');

const bootstrapAssessment = async (user) => {
  appUser = user;
  let assessmentDoc;

  try {
    assessmentDoc = await fetchImpliedAssessment();
  } catch (error) {
    notify('Unable to load your assessment, please retry.');
    console.warn(error.message);

    ga('send', {
      hitType: 'event',
      nonInteraction: true,
      eventCategory: 'Playground',
      eventLabel: `${error.message}`,
      eventAction: 'fetch-implied-assessment'
    });
  }

  if(assessmentDoc && assessmentDoc.exists && assessmentIsLive(assessmentDoc)) {
    await enterPlayground(assessmentDoc);
  } else {
    notify(invalidURLMsg);
  }
};

const setupAuthentication = () => {
  provider = new firebase.auth.GithubAuthProvider();
  provider.addScope('repo');
  provider.setCustomParameters({
    allow_signup: 'false'
  });

  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      enterHome(testId);
      setupSignIn();

      ga('send', {
        hitType: 'event',
        nonInteraction: true,
        eventCategory: 'Playground',
        eventAction: 'setup-signin'
      });

      return;
    }
  
    goTo('intro', { test: testId });
    bootstrapAssessment(user);
    gtag('set', {'user_id': user.email}); 
  });
};

const takeOff = async () => {
  handleWindowPopState();

  toast = mdc.snackbar.MDCSnackbar.attachTo(select('#intro-toast'));
  const { pathname } = window.location;

  if (pathname === '/' || pathname === '/!') {
    enterHome();
    notify(invalidURLMsg);
    return;
  }

  const matches = pathname.match(/\/(.+)/);
  if (matches && matches[1]) {
    testId = matches[1].replace(/\/?!?$/, '');

    if (!testId) {
      enterHome();
      notify(invalidURLMsg);
      return;
    }

    notify('Busy. Loading Critical Assets. Please Wait ...');
    const fb = await importFirebaseInitializer();
    
    notify('Busy, please wait ...');
    await fb.init();
    setupAuthentication();
  }
};

document.addEventListener('DOMContentLoaded', takeOff);
