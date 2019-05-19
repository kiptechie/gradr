import firebase from 'firebase/app';

import { select, goTo, handleWindowPopState } from '../../commons/js/utils.js';

import {
  importDash,
  importFirebaseInitializer
} from './module-manager.js';

let provider;

const signIn = () => {
  if (!provider) return;

  firebase
    .auth()
    .signInWithPopup(provider)
    .catch(error => {
      const { code, message } = error;
      console.warn(`${code} => ${message}`);
    });
};

const setupSignIn = () => {
  const signInBtn = select(`[data-view='home'] button`);
  if (signInBtn) {
    signInBtn.addEventListener('click', signIn);
  }
};

const takeOff = () => {
  handleWindowPopState();

  importFirebaseInitializer().then(fbInitializer => {
    fbInitializer.init();

    // TODO switch to email/password  provider
    provider = new firebase.auth.GithubAuthProvider();
    provider.addScope('repo');
    provider.setCustomParameters({
      allow_signup: 'false'
    });

    firebase.auth().onAuthStateChanged(user => {
      if(user) {
        importDash().then(dash => {
          dash.enter(user);
        });
        return;
      }

      goTo('home');
      setupSignIn();
    });
  });
};

document.addEventListener('DOMContentLoaded', takeOff);