import firebase from 'firebase/app';

import marked from 'marked';
import emmet from '@emmetio/codemirror-plugin';

import {
  rAF,
  trim,
  goTo,
  select,
  selectAll,
  countDown,
  extractCode,
  dateTimeDiff,
  isWithinDeadline,
  loadCodemirrorAssets
} from '../../commons/js/utils.js';

let spec;
let toast;
let device;
let editor;
let appUser;
let testId;
let projectId;
let assessment;
let instructions;
let sandboxWindow;

let batchedProgress = [];
let assessmentProgress = {};
let savingBatchedProgress = false;

const SPECS = firebase.firestore().collection('specs');
const SUBMISSIONS = firebase.firestore().collection('submissions');

const challengeInfo = select('[data-challenge-info]');
const testOverMsg = 'This assessment is closed. Your changes will not be saved or evaluated';

const notify = (msg) => {
  let message = trim(msg);
  if (message === '') return;

  if(message === 'ERROR') {
    message = `You've Got One Or More Syntax Errors In Your Code!`;
  }

  const toastr = select('#toast');
  if (!toast) toast = mdc.snackbar.MDCSnackbar.attachTo(toastr);
  // toast.close();

  toastr.querySelector('.mdc-snackbar__label').textContent = message;
  toast.timeoutMs = 10000;
  toast.open();
};

const signOut = event => {
  event.preventDefault();
  firebase.auth().signOut();
};

const setupAccount = () => {
  if(appUser.photoURL) {
    const img = document.createElement("img");
    img.src = appUser.photoURL;
    const src = document.getElementById("photo");
    src.appendChild(img);
  }
  const userIconBtn = select('button[data-profile]');
  const usrMenu = mdc.menu.MDCMenu.attachTo(select('.mdc-menu'));
  userIconBtn.addEventListener('click', event => {
    event.preventDefault();
    usrMenu.open = true;
  });
  usrMenu.setFixedPosition(true);
  select('#signout').addEventListener('click', signOut);
};

const prepareEmulatorPreview = () => {
  if(device) device.classList.remove('live');
  if(instructions) instructions.classList.remove('live');
};

const switchPreviewToEmulator = () => {
  if(instructions) {
    instructions.classList.remove('live');
  }

  if(device) {
    device.classList.add('live');
  }

  select('#toggle-viewer').classList.add('mdc-icon-button--on');
};

const switchPreviewToInstructions = () => {
  if(device) {
    device.classList.remove('live');
  }
  
  if(instructions) {
    instructions.classList.add('live');
  }

  select('#toggle-viewer').classList.remove('mdc-icon-button--on');
};

const showCountdown = async () => {
  if (!('RelativeTimeFormat' in Intl)) {
    await import('intl-relative-time-format');
  }

  const { endingAt } = assessment;
  const deadline = new Date(`${endingAt}`);

  const timeSplainer = select(`[data-timer]`);
  const timer = timeSplainer.querySelector('span');
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const displayCountdown = ({ diff, diffType }) => {
    if (diff < 0 && diffType === 'second') {
      let type = 'hour';
      let ellapsedDiff = dateTimeDiff({ to: deadline, type });

      if(ellapsedDiff > 24) {
        type = 'day'
        ellapsedDiff = dateTimeDiff({ to: deadline, type });
      }

      timer.textContent = rtf.format(ellapsedDiff, type);
      return;
    }
    timer.textContent = rtf.format(diff, `${diffType}`);
    timeSplainer.setAttribute('data-timer-on', 'why-not');
  };

  countDown({ to: deadline, callback: displayCountdown });
};

const updateProjectWork = changes => SUBMISSIONS.doc(projectId).update(changes);

const createProject = async (email) => {
  let { starterCodebase } = spec;

  // TODO remove this after fully migrating
  // all starter code into SPECs
  if(!starterCodebase) {
    const response = await fetch('/engines/tpl/start.html');
    starterCodebase = await response.text();
  }

  const entry = {
    email,
    assessment: testId,
    firstSeen: Date.now(),
    code: starterCodebase
  };

  const ref = await SUBMISSIONS.add(entry);
  projectId = ref.id;
  const project = await SUBMISSIONS.doc(projectId).get();  
  return project;
};

const updateLastSeenTime = async (project) => {
  projectId = project.id;
  const entry = {
    lastSeen: Date.now()
  };

  await updateProjectWork(entry);
  const updated = await SUBMISSIONS.doc(projectId).get();
  return updated;
};

const createOrUpdateProject = async () =>  {
    const { email } = appUser;
    const query = SUBMISSIONS
      .where('assessment', '==', testId)
      .where('email', '==', email);
    
    const snapshot = await query.get();
    if(snapshot.empty === true) {
      notify('Initialising your assessment, please wait ...');
      const created = await createProject(email);
      return created;
    } 

    const [doc] = snapshot.docs;
    const updated = await updateLastSeenTime({
      id: doc.id, 
      data: doc.data()
    });
    return updated;
};

const setupInstructions = async (challengeIndex) => {
  if (challengeIndex < 0) {
    let assessmentName = assessment.name || 'Andela Fellowship';
    assessmentName = assessmentName.replace(/\s+\w+-\d{2,}$/, '');

    const response = await fetch(`/engines/tpl/intro.md`);
    const text = await response.text();
    return text
      .replace('{name}', appUser.displayName || '')
      .replace('{program}', assessmentName)
      .replace('{app}', spec.about)
      .replace('{challenges}', spec.challenges.length || 'a few')
      .replace('{specname}', spec.name || 'your app')
      .replace('{specname}', spec.name || 'your app');
  }

  if (challengeIndex >= spec.challenges.length) {
    const response = await fetch(`/engines/tpl/outro.md`);
    const text = await response.text();
    return text.replace('{name}', appUser.displayName || '');
  }

  return spec.challenges[challengeIndex].guide;
};

const safelyIncrementChallengeIndex = (challengeLength, challengeIndex) => {
    const normalised =
      challengeIndex >= challengeLength ? challengeLength : challengeIndex + 1;
    return normalised;
};

const navigateToChallengeInstructions = async (challengeIndex) => {
  const intructions = await setupInstructions(challengeIndex);
  if(challengeInfo) {
    challengeInfo.innerHTML = marked(intructions, {
      gfm: true,
      smartLists: true
    });
  }

  const appTitle = select('#instructions span.what');
  const progress = select('#instructions span.step');

  const challengeLen = spec.challenges.length;
  const normalised = safelyIncrementChallengeIndex(challengeLen, challengeIndex);
  
  if (appTitle && progress) {
    appTitle.textContent = spec.name;
    progress.textContent =
      challengeIndex < 0
        ? 'Mini App!'
        : `Challenge ${normalised} of ${challengeLen}`;

    if(normalised > challengeLen) {
      progress.textContent = `You've Completed ${progress.textContent}`
    }
  }
  return instructions;
};

const displayProgressAndInstructions = async (challengeIndex) => {
  await navigateToChallengeInstructions(challengeIndex);
  const challengeLen = spec.challenges.length;
  const normalised = safelyIncrementChallengeIndex(challengeLen, challengeIndex);

  localStorage.setItem(
    'challengeIndex',
    normalised === challengeLen ? normalised - 1 : normalised
  );

  if(challengeIndex >= 0) {

    Array.from(selectAll(`button[data-challange-step]`))
    .map(btn => {
      if(btn) {
        // btn.setAttribute('disabled', 'disabled');
        btn.removeAttribute('data-challange-status');
        btn.removeAttribute('data-challange-audit');
      }
      return btn;
    });

    const challangeSlots = Array.from({length: challengeLen + 1}, (x, i) => i);
    const slotsCoverage = challangeSlots.slice(0, challangeSlots.indexOf(challengeIndex));

    // tick off challenges the candidate has completed
    slotsCoverage.forEach(slot => {
      const btn = select(`button[data-challange-step='${slot}']`);
      if(btn) {
        btn.setAttribute('data-challange-audit', 'passing');
      }
    });

    // indicate the current challenge
    const btn = select(`button[data-challange-step='${challengeIndex}']`);
    if(btn) {
      btn.setAttribute('data-challange-status', 'active');
    }
  }
};

const getAssessmentSpec = async () => {
  if(!spec || spec.id !== assessment.spec) {
    const specification = await SPECS.doc(assessment.spec).get();
    spec = {
      id: specification.id,
      ...specification.data()
    };
  } 

  return spec;
};

const progressTo = async (challengeIndex) => {
  await getAssessmentSpec();
  displayProgressAndInstructions(challengeIndex);
};

const getCode = () => {
  let codebase = editor.getValue();
  if (!codebase) {
    const { code } = JSON.parse(localStorage.getItem('work'));
    codebase = code;
  }
  return codebase;
};

const initProject = async () => {
  const challengeIndex = 0;
  const started = Date.now();

  await updateProjectWork({ started, challengeIndex });
  assessmentProgress = {challengeIndex, completedChallenge: -1};
  select('body').setAttribute('data-assessment', started);
  
  progressTo(challengeIndex);
  let aName = [''];
  if(appUser && appUser.displayName) {
    aName = appUser.displayName.split(/\s+/);
  }
  notify(`Yo, you can now begin the assessment. Take it away ${aName[0]}!`);
  rAF({ wait: 500 }).then(() => {
    select('body').classList.remove('mdc-dialog-scroll-lock', 'mdc-dialog--open');
  });
};

const challengeIntro = async () => {
  select('button.action-begin').addEventListener('click', () => {
    select('body').classList.add('mdc-dialog-scroll-lock', 'mdc-dialog--open');

    let aName = [''];
    if(appUser && appUser.displayName) {
      aName = appUser.displayName.split(/\s+/);
    }
    notify(`Thats right ${aName[0]}! Please wait while we start things off for you ...`);
    initProject();
  });

  // await getAssessmentSpec();
  displayProgressAndInstructions(-1);
  switchPreviewToInstructions();
};

const playCode = () => {
  const challengeIndex = parseInt(localStorage.getItem('challengeIndex'), 10);
  if (challengeIndex < 0) {
    initProject();
  }

  const code = getCode();
  if (!code) return;

  notify('Lets Run Your Code ...');

  prepareEmulatorPreview();
  const payload = extractCode(code);
  sandboxWindow.postMessage(
    {
      payload,
      spec: spec.id,
      assessment: testId
    },
    window.location.origin
  );
};

const handleChallengeNavClicks = (event) => {
  event.preventDefault();
  
  const target = event.target.closest('button');
  const isActive = target.getAttribute('data-challange-status') === 'active'
  const isPassing = target.getAttribute('data-challange-audit') === 'passing'
  
  if(isActive || isPassing) {
    const step = target.getAttribute('data-challange-step') || 0;
    navigateToChallengeInstructions( parseInt(step, 10) );
    switchPreviewToInstructions();
  }
};

const setTheStage = async (challengeIndex, started) => {
  localStorage.setItem('challengeIndex', challengeIndex);
  notify('building your playground ...');

  mdc.topAppBar.MDCTopAppBar.attachTo(select('.mdc-top-app-bar'));
  setupAccount();

  select('#runit').addEventListener('click', (event) => {
    event.preventDefault();
    playCode();
  });

  Array.from(selectAll(`button[data-challange-step]`)).forEach(btn => {
    btn.addEventListener('click', handleChallengeNavClicks);
    const btnRipple = mdc.ripple.MDCRipple.attachTo(btn);
    btnRipple.unbounded = true;
  });

  const toggleViewer = new mdc.iconButton.MDCIconButtonToggle(select('#toggle-viewer'));
  toggleViewer.listen('MDCIconButtonToggle:change', ({detail}) => {
    if(detail.isOn === true) {
      switchPreviewToEmulator();
    } else {
      switchPreviewToInstructions();
    }
  });

  notify('building your auto-grader ...');

  const sandbox = select('#sandbox');
  const viewer = select('#viewer');
  sandbox.setAttribute('src', '/engines/sandbox.html');
  sandboxWindow = sandbox.contentWindow;

  if (challengeIndex >= 0 && started) {
    select('body').setAttribute('data-assessment', started);
  }

  await loadCodemirrorAssets({ mode: 'htmlmixed' });
  emmet(CodeMirror);
  const codeEditor = CodeMirror(select('#code'), {
    theme: 'idea',
    autofocus: true,
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    mode: { name: 'htmlmixed' },
    extraKeys: {
      Tab: 'emmetExpandAbbreviation',
      Enter: 'emmetInsertLineBreak'
    }
  });

  notify('DONE!');
  return { codeEditor, sandbox, viewer };
};

const saveWorkBatched = async () => {
  savingBatchedProgress = true;
  const start = {completedChallenge: -1, challengeIndex: 0};
  const performance = batchedProgress.reduce((perf, {completedChallenge, challengeIndex}) => {
    if(completedChallenge > perf.completedChallenge) {
      return {completedChallenge, challengeIndex};
    }
    return perf;
  }, start);

  await updateProjectWork({
    ...performance,
    lastRun: Date.now(),
    code: editor.getValue()
  });

  batchedProgress = [];
  savingBatchedProgress = false;
  assessmentProgress = {...assessmentProgress, ...performance};
};

const saveWork = ({completedChallenge, challengeIndex}) => {
  if(batchedProgress.length === 0) {
    setTimeout(() => {
      saveWorkBatched();
    }, 5000);
  }

  if(savingBatchedProgress === true) return;

  batchedProgress.push({completedChallenge, challengeIndex});
};

const handleSandboxMessages = async (event) => {
  if (event.origin !== window.location.origin) return;

  const { feedback, advancement } = event.data;

  if (feedback) {
    notify(feedback.message);
  }

  const { endingAt } = assessment;
  if (isWithinDeadline({ endingAt })) {

    if(advancement) {
      const { index, completed } = advancement;
      const normalisedIndex = index >= spec.challenges.length ? completed : index;

      saveWork({
        completedChallenge: completed,
        challengeIndex: normalisedIndex
      });
      progressTo(index);
    } else {
      saveWork({
        challengeIndex: assessmentProgress.challengeIndex,
        completedChallenge: assessmentProgress.completedChallenge
      });
    }
  } else {
    notify( testOverMsg );
  }

  switchPreviewToEmulator();
};

const handleSpecialKeyCombinations = () => {
  document.addEventListener('keyup', event => {
    const key = event.which || event.keyCode;

    if (event.ctrlKey && key === 13) {
      playCode();
    }
  });
};

const proceed = async (project) => {
  const { code, started, challengeIndex } = project;
  const whereAmI = !started ? -1 : parseInt(challengeIndex, 10); 

  const stage = await setTheStage(whereAmI, started);
  const { codeEditor, viewer } = stage;
  device = viewer;
  editor = codeEditor;
  editor.setValue(code);

  editor.on("beforeChange", (_, change) => {
    if (change.origin === 'paste') change.cancel();
  });
  editor.refresh();

  instructions = select('#instructions');
  rAF({ wait: 500 }).then(() => showCountdown());
  window.addEventListener('message', handleSandboxMessages);
  handleSpecialKeyCombinations();

  if (whereAmI === -1) {
    challengeIntro();
  } 
  
  if (whereAmI >= 0) {
    await progressTo(whereAmI);
    const existingWork = await SUBMISSIONS.doc(projectId).get();
    const data = existingWork.data();
    assessmentProgress = {...assessmentProgress, ...{
      challengeIndex: data.challengeIndex,
      completedChallenge: data.completedChallenge 
    }};

    const { endingAt } = assessment;
    if (isWithinDeadline({ endingAt })) {
      if((whereAmI + 1) >= spec.challenges.length) {
        // though within deadline, this user has completed this assessment. 
        playCode();
        return;
      } 
      switchPreviewToInstructions();
      return;
    }
    playCode();
  }

};

const deferredEnter = async (args) => {
  const { user, test, assessmentDoc } = args;
  testId = test;
  appUser = user;

  assessment = {
    id: assessmentDoc.id,
    ...assessmentDoc.data()
  };

  goTo('playground', { test });

  await getAssessmentSpec();
  const project = await createOrUpdateProject();
  proceed(project.data());
};

export const enter = async (args = {}) => {
  notify('Building your playground, please wait ...');
  deferredEnter(args); 
};
export default { enter };


