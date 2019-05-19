import firebase from 'firebase/app';

import marked from 'marked';
import emmet from '@emmetio/codemirror-plugin';

import {
  rAF,
  trim,
  goTo,
  select,
  selectAll,
  setAttrs,
  countDown,
  extractCode,
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

const showCountdown = () => {
  if(typeof Intl.RelativeTimeFormat === 'function') {
    const timerEl = select(`[data-timer]`);
    const { endingAt } = assessment;

    const deadline = new Date(`${endingAt}`);
    const diffType = 'hour';

    const displayCountdown = (diff) => {
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      const howfar = rtf.format(diff, diffType);

      timerEl.querySelector('span').textContent = howfar;
      timerEl.setAttribute('data-timer-on', 'why-not');
    };

    countDown({
      to: deadline,
      type: diffType,
      callback: displayCountdown
    });
  }
};

const createProject = async (email) => {
  // TODO get this from the SPEC
  const response = await fetch('/engines/todo/start.html');
  const code = response.text();
  const entry = {
    email,
    code,
    assessment: testId,
    firstSeen: Date.now()
  };

  const ref = await SUBMISSIONS.add(entry);
  return await SUBMISSIONS.doc(ref.id).get();  
};

const updateLastSeenTime = async ([project]) => {
  projectId = project.id;
  const entry = {
    lastSeen: Date.now()
  };

  // await SUBMISSIONS.doc(id).update(entry);
  await updateProjectWork(entry);
  return await SUBMISSIONS.doc(projectId).get();
};

const createOrUpdateProject = async () =>  {
    const { email } = appUser;
    const query = SUBMISSIONS
      .where('assessment', '==', testId)
      .where('email', '==', email)
    
    const snapshot = await query.get();
    const projects = [];
    snapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        data: doc.data()
      });
    });

    if (projects.length === 0) {
      notify('Initialising your assessment, please wait ...');
      return await createProject(email);
    }

    return await updateLastSeenTime(projects);
};

const setupInstructions = async (challengeIndex) => {
  if (challengeIndex < 0) {
    let assessmentName = assessment.name || 'Andela Fellowship';
    assessmentName = assessmentName.replace(/\s+\w+-\d{2,}$/, '');

    const response = await fetch(`/engines/todo/intro.md`);
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
    const response = await fetch(`/engines/todo/outro.md`);
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

    if(normalised >= challengeLen) {
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
        btn.setAttribute('disabled', 'disabled');
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

const updateProjectWork = changes => SUBMISSIONS.doc(projectId).update(changes);

const initProject = async () => {
  const challengeIndex = 0;
  const started = Date.now();

  await updateProjectWork({ started, challengeIndex });
  select('body').setAttribute('data-assessment', started);
  
  progressTo(challengeIndex);
  notify(`Yo, you can now begin the assessment. Take it away ${appUser.displayName.split(/\s+/)[0]}!`);
  rAF({ wait: 2000 }).then(() => {
    select('body').classList.remove('mdc-dialog-scroll-lock', 'mdc-dialog--open');
  });
};

const challengeIntro = async () => {
  await getAssessmentSpec();
  select('button.action-begin').addEventListener('click', (event) => {
    select('body').classList.add('mdc-dialog-scroll-lock', 'mdc-dialog--open');
    notify(`Thats right ${appUser.displayName}! Please wait while we start things off for you ...`);
    initProject();
  });

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

  selectAll(`[data-challange-step]`).forEach(btn => {
    if(btn) {
      btn.addEventListener('click', handleChallengeNavClicks);
      const btnRipple = mdc.ripple.MDCRipple.attachTo(btn);
      btnRipple.unbounded = true;
    }
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
  let sandbox = document.createElement('iframe');
  sandbox = setAttrs(sandbox, {
    id: 'sandbox',
    frameborder: 0,
    src: '/engines/sandbox.html',
    sandbox: 'allow-same-origin allow-scripts'
  });

  const viewer = select('#viewer');
  const screen = select('#viewer .screen');
  screen.appendChild(sandbox);
  sandboxWindow = select('#sandbox').contentWindow;

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

const saveWork = async ({completedChallenge, challengeIndex}) => {
  return await updateProjectWork({
    challengeIndex,
    completedChallenge,
    lastRun: Date.now(),
    code: editor.getValue()
  });
};

const handleSandboxMessages = async (event) => {
  if (event.origin !== window.location.origin) return;

  const { error, feedback, advancement } = event.data;
  if(error) {
    notify('ERROR', error);
    return;
  }

  if (feedback) {
    const { message } = feedback;
    notify(message);
  }

  const { endingAt } = assessment;
  if (isWithinDeadline({ endingAt })) {
    // TODO this condition on advancement prevents challange-1 code from being saved
    if(advancement) {
      const { index, completed } = advancement;
      const normalisedIndex = index >= spec.challenges.length ? completed : index;

      await saveWork({
        completedChallenge: completed,
        challengeIndex: normalisedIndex
      });
      progressTo(index);
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

    // TODO disable Ctrl + S
    // TODO disable Ctrl + V & Ctrl + C
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
  editor.refresh();

  instructions = select('#instructions');
  rAF({ wait: 500 }).then(() => showCountdown());

  if (whereAmI === -1) {
    challengeIntro();
  } 
  
  if (whereAmI >= 0) {
    await progressTo(whereAmI);
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

  window.addEventListener('message', handleSandboxMessages);
  handleSpecialKeyCombinations();
};

const deferredEnter = async (args) => {
  const { user, test, assessmentDoc } = args;
  testId = test;
  appUser = user;

  assessment = {
    id: assessmentDoc.id,
    ...assessmentDoc.data()
  };

  const project = await createOrUpdateProject();
  projectId = project.id;

  goTo('playground', { test });
  proceed(project.data());
};

export const enter = (args = {}) => {
  notify('Setting your playground, please wait ...');
  deferredEnter(args);

  // SUBMISSIONS
  //   .where('email', '==', 'chaluwa@gmail.com')
  //   .where('assessment', '==', 'ftvOCDuoSB29i8y69lAZ')
  //   .get()
  //   .then(snapshot => {
  //     if(snapshot.size >= 1) {
  //       snapshot.docs.forEach(doc => {
  //         SUBMISSIONS.doc(doc.id).delete().then(() => {
  //           console.log('deleted chaluwa entry');
  //           deferredEnter(args);
  //         });
  //       });
  //     } else {
  //       deferredEnter(args);
  //     }
  //   });  
};

export default { enter };


// TODO Code Playback
// TODO Code Comparison
// TODO Code Similarity

