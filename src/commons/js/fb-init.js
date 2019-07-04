import * as firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/performance';

const cfg = {
  apiKey: 'AIzaSyAPtzAvpJFH6Dr2MO3TjrgV02dkoBC6Iho',
  authDomain: 'alc-dev-toolkit-d50fe.firebaseapp.com',
  databaseURL: 'https://alc-dev-toolkit-d50fe.firebaseio.com',
  projectId: 'alc-dev-toolkit-d50fe',
  storageBucket: 'alc-dev-toolkit-d50fe.appspot.com',
  messagingSenderId: '786236201902',
  appId: '1:786236201902:web:74e909fd00578ef3'
};

export const getConfig = () => cfg;

export const init = () => {
  firebase.initializeApp(cfg);
  firebase.performance();
};

export default { init };
