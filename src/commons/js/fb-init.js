import firebase from 'firebase/app';
import auth from 'firebase/auth';
import firestore from 'firebase/firestore';
import 'firebase/performance';

const cfg = {
  apiKey: "AIzaSyAPtzAvpJFH6Dr2MO3TjrgV02dkoBC6Iho",
  authDomain: "alc-dev-toolkit-d50fe.firebaseapp.com",
  databaseURL: "https://alc-dev-toolkit-d50fe.firebaseio.com",
  projectId: "alc-dev-toolkit-d50fe"
};

export const getConfig = () => cfg;

export const init = () => {
  firebase.initializeApp(cfg);
  firebase.performance();
};

export default { init };
