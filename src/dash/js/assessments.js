import firebase from 'firebase/app';
import Chart from 'chart.js';
import 'chartjs-plugin-colorschemes';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-plugin-doughnutlabel';

import { html, render } from 'lit-html';

import {
  select,
  goTo,
  rAF,
  toSlug,
  trim,
  exceptId,
  dateTimeDiff,
  selectAll
} from '../../commons/js/utils.js';

let chart;
let builtUI = false;
let assessment = {};
let candidates = [];
let candidatesStatus = 'Completed NONE';

let monitoringCanSaveTest = false;

const specifications = [];

const SPECS = firebase.firestore().collection('specs');
const ASSESSMENTS = firebase.firestore().collection('assessments');
const SUBMISSIONS = firebase.firestore().collection('submissions');

const testsListEl = select('#tests-list');
const saveTestBtn = select(`[data-action='save-test']`);
const extractTestIDBtn = select(`[data-action='extract-test-id']`);

const specsListItemTPL = specs => html`
  ${specs.map(
    item => html`
      <option value=${item.id} data-key=${item.id}> ${item.name} </option>
    `
  )}
`;

const perfGroupItemTPL = groups => html`
  ${groups.map(
    item => html`
      <option value=${item.value}> ${item.text} </option>
    `
  )}
`;

const candidateListTPL = pool => html`
  ${pool.map(
    item => html`
      <tr>
        <td>${item.email}</td>
        <td class="align-center">
          ${item.completedChallenge >= 0
            ? `Challenge ${item.completedChallenge + 1}`
            : 'Not A Single Challenge'}
        </td>
        <td>
          ${item.completedChallenge >= 0
            ? formatDate(item.lastRun)
            : 'Not Applicable'}
        </td>
      </tr>
    `
  )}
`;

const getAssessmentPublicKey = () =>
  assessment.id
    .split('')
    .reverse()
    .join('');

/**
 * @description this checks whether an assessment is ongoing or not
 * and sets the value of the global variable called "candidatesStatus"
 *
 * @param { object } theAssessment
 */
const droppedOutOrCompletedNone = theAssessment => {
  if (theAssessment && theAssessment.endingAt) {
    const secondsToGo =
      Date.parse(theAssessment.endingAt) - Date.parse(new Date());
    candidatesStatus = secondsToGo < 0 ? 'Dropped Out' : 'Completed NONE';
  }
};

const setAssessmentObject = (obj = {}) => {
  droppedOutOrCompletedNone(obj);
  assessment = obj;
  if (obj.id) {
    extractTestIDBtn.removeAttribute('disabled');
  } else {
    extractTestIDBtn.setAttribute('disabled', 'disabled');
  }
};

const query = (path, clauses = []) => {
  const collection =
    typeof path === 'string' ? firebase.firestore().collection(path) : path;

  return clauses
    .reduce((queryBuilder, queryString) => {
      const queryTokens = queryString.trim().split(/\s+/);
      const [key, operator, value] = queryTokens;
      const normalisedValue = isNaN(value) ? value : Number(value);
      return queryBuilder.where(`${key}`, `${operator}`, normalisedValue);
    }, collection)
    .get();
};

const getChallengeCount = () => {
  let challengeCount = 0;

  return new Promise(resolve => {
    if (challengeCount >= 1) return resolve(challengeCount);

    return SPECS.doc(assessment.spec)
      .get()
      .then(spec => spec.data().challenges.length)
      .then(count => {
        challengeCount = count;
        return resolve(challengeCount);
      });
  });
};

const perfQuery = percentile =>
  getChallengeCount()
    .then(challengeCount => {
      if (percentile >= 0) {
        return [
          `completedChallenge == ${Math.ceil(
            percentile * (challengeCount - 1)
          )}`
        ];
      }

      return [];
    })
    .then(clauses => {
      const allClauses = [
        `assessment == ${getAssessmentPublicKey()}`,
        ...clauses
      ];
      return query(SUBMISSIONS, allClauses);
    });

const stars = () => perfQuery(0.75);
const levelUps = () => perfQuery(0.5);
const highTryAgains = () => perfQuery(0.25);
const lowTryAgains = () => perfQuery(0);
const allOfThem = () => perfQuery();

const doesAssessmentHaveSubmissions = () =>
  new Promise(resolve => {
    let hasSubmissions = false;
    if (assessment && assessment.id) {
      query(SUBMISSIONS, [`assessment == ${getAssessmentPublicKey()}`]).then(
        snapshot => {
          if (snapshot.size >= 1) {
            hasSubmissions = true;
          }
          resolve(hasSubmissions);
        }
      );
    } else {
      resolve(hasSubmissions);
    }
  });

const extriesAreValid = () => {
  const { name, slug, cycle, startingAt, endingAt } = assessment;
  return (
    trim(name) !== '' &&
    trim(cycle) !== '' &&
    trim(endingAt) !== '' &&
    trim(startingAt) !== ''
  );
};

const clearInputValues = () => {
  [
    select('#testname-field input'),
    select('#testcycle-field input'),
    select('#from-date-field input'),
    select('#to-date-field input'),
    select('#select-spec select')
  ].forEach(input => {
    const field = input;
    field.value = '';
  });
};

const searchByEmail = () => {
  const emailInput = select('.email-search-input');
  const candidateTable = select('[data-candidate-pool]');

  const handleSearchQuery = () => {
    const input = trim(emailInput.value).toLowerCase();
    const matches = candidates.filter(
      ({ email }) => email && email.indexOf(input) !== -1
    );
    render(candidateListTPL(matches), candidateTable);
  };

  emailInput.addEventListener('keyup', () => {
    rAF().then(() => handleSearchQuery());
  });
};

const canSaveTest = () => {
  if (extriesAreValid() === true) {
    saveTestBtn.removeAttribute('disabled');
  } else {
    saveTestBtn.setAttribute('disabled', true);
  }

  rAF({ wait: 2000 }).then(() => canSaveTest());
  monitoringCanSaveTest = true;
};

const saveTest = d => {
  const { id } = d;
  const details = { ...d, ...{ slug: toSlug(`${d.name}-${d.cycle}`) } };

  if (id) {
    const changes = exceptId(details);
    return ASSESSMENTS.doc(id)
      .update(changes)
      .then(() => ASSESSMENTS.doc(id))
      .then(doc => doc.get());
  }

  return ASSESSMENTS.add({
    ...details,
    status: 'active',
    createAt: Date.now()
  })
    .then(ref => {
      const key = ref.id;
      const publicKey = key
        .split('')
        .reverse()
        .join('');

      ASSESSMENTS.doc(key).update({ publicKey });

      return ASSESSMENTS.doc(key);
    })
    .then(doc => doc.get());
};

const fieldValueChanged = event => {
  const input = event.target;
  if (!input || !input.value) return;

  const key = input.getAttribute('data-field');
  if (!key) return;

  const value = trim(input.value);
  assessment[key] = value;
};

const formatDate = datetime => {
  if (!assessment || !assessment.endingAt) return datetime;

  const diff = dateTimeDiff({
    type: 'hour',
    from: new Date(datetime).getTime(),
    to: new Date(assessment.endingAt).getTime()
  });

  const timeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const part = timeFormat
    .formatToParts(diff, 'hour')
    .find(p => p.type === 'integer');

  if (part) {
    let formatStr = '';
    const value = parseInt(part.value, 10);
    if (value === 0) formatStr = `The 11th Hour`;

    if (value >= 1) {
      formatStr = `${value} ${value === 1 ? 'Hour' : 'Hours'} Upfront`;
    }
    return formatStr;
  }

  return timeFormat.format(diff, 'hours');
};

const getChartDataTPL = () => ({
  labels: [
    'Completed Challenge 4',
    'Completed Challenge 3',
    'Completed Challenge 2',
    'Completed Challenge 1',
    candidatesStatus,
    "Didn't Start"
  ],
  datasets: [
    {
      label: '',
      data: [],
      borderWidth: 1
    }
  ]
});

const initChart = () => {
  const countCandidates = theChart => {
    const sum = theChart.config.data.datasets[0].data.reduce((a, b) => {
      return !b ? a : a + b;
    }, 0);
    return `${sum}`;
  };

  chart = new Chart(select('#chart'), {
    type: 'doughnut',
    data: getChartDataTPL(),
    options: {
      plugins: {
        colorschemes: {
          scheme: 'office.Median6'
        },
        doughnutlabel: {
          labels: [
            {
              text: countCandidates,
              font: {
                size: '60'
              },
              color: 'grey'
            },
            {
              text: 'Candidates',
              font: {
                size: '50'
              }
            }
          ]
        }
      }
    }
  });
};

const updateChart = data => {
  chart.data.datasets.forEach(dataset => {
    dataset.data.push(data);
  });
  chart.update();
};

const addAndPlotPerfEntries = (docs, candidateTable) => {
  const mapped = docs.map(doc => {
    const {
      email,
      lastRun,
      started,
      challengeIndex = -1,
      completedChallenge = -1
    } = doc.data();

    return {
      email,
      lastRun,
      started,
      challengeIndex,
      completedChallenge
    };
  });

  candidates.push(...mapped);
  render(candidateListTPL(candidates), candidateTable);
  updateChart(docs.length || undefined);
};

const resetDataAndChart = () => {
  candidates = [];
  if (!chart) initChart();
  chart.data = getChartDataTPL();
  chart.update();

  const candidateTable = select('[data-candidate-pool]');
  render(candidateListTPL(candidates), candidateTable);
};

const computePerformanceMatrix = () => {
  const candidateTable = select('[data-candidate-pool]');
  render(candidateListTPL(candidates), candidateTable);

  [stars(), levelUps(), highTryAgains(), lowTryAgains(), allOfThem()].forEach(
    (result, index) => {
      result.then(snapshot => {
        if (index <= 3) {
          addAndPlotPerfEntries(snapshot.docs, candidateTable);
        } else if (index >= 4) {
          const [notStarted, dropOuts] = snapshot.docs.reduce(
            (sink, d) => {
              const { started, completedChallenge } = d.data();
              if (!started) sink[0].push(d);
              if (
                started &&
                (completedChallenge === undefined || completedChallenge === -1)
              ) {
                sink[1].push(d);
              }

              return sink;
            },
            [[], []]
          );

          addAndPlotPerfEntries(dropOuts, candidateTable);
          addAndPlotPerfEntries(notStarted, candidateTable);
        }
      });
    }
  );

  getChallengeCount().then(challengeCount => {
    const perfSelector = select('[data-candidate-perfs] select');
    const perfGroups = Array.from({ length: challengeCount }, (item, index) => {
      return { value: index, text: `Complete Challenge ${index + 1}` };
    });

    const allPerfGroups = [
      { value: 'all', text: 'All Entries' },
      { value: 'allstars', text: 'Completed Top 2 Challenges' },
      ...perfGroups.reverse(),
      { value: 'bailers', text: 'Bailers' }
    ];

    render(perfGroupItemTPL(allPerfGroups), perfSelector);
    // console.log(allPerfGroups);
  });
};

const findCandidatesByPerf = perf => {
  if (!perf || perf === 'all') return candidates.slice();

  const spec = specifications.find(s => s.id === assessment.spec);

  if (perf === 'allstars' && spec) {
    const challenges = Array.from(
      { length: spec.challenges.length },
      (x, i) => i
    );
    const [last, penultimate] = challenges.reverse();
    return candidates
      .slice()
      .filter(e => [last, penultimate].includes(e.completedChallenge));
  }

  if (perf === 'bailers') {
    return candidates.slice().filter(e => !e.started);
  }

  return candidates
    .slice()
    .filter(e => e.completedChallenge === parseInt(perf, 10));
};

const filterCandidatesByPerf = value => {
  const filtered = findCandidatesByPerf(value);
  render(candidateListTPL(filtered), select('[data-candidate-pool]'));
};

const handleExport = () => {
  const { slug } = assessment;
  const forExport = select('[data-candidate-perfs] select').value;
  const data = findCandidatesByPerf(forExport);
  const csvContent = ['data:text/csv;charset=utf-8,'];

  data
    .map(({ email, lastRun, started, completedChallenge }) => {
      let submitted = '';
      let performance = '';
      if (!started) {
        performance = `Didn't Start`;
      } else if (started && completedChallenge === undefined) {
        performance = `Dropped Out`;
      } else if (started && completedChallenge >= 0) {
        performance = `${completedChallenge + 1}`;
        submitted = lastRun ? `${formatDate(lastRun)}` : 'Not Once';
      }

      return [email, performance, submitted, slug];
    })
    .forEach(entry => {
      const row = entry.join(',');
      csvContent.push(`${row} \r\n`);
    });

  window.open(encodeURI(csvContent));
};

const attemptDisplayAssessmentAdminUI = () => {
  select(`[data-view='create-edit-test']`).removeAttribute(
    'data-test-hasentries'
  );

  doesAssessmentHaveSubmissions().then(hasSubmissions => {
    if (hasSubmissions !== true) {
      select(`[data-view='create-edit-test']`).removeAttribute(
        'data-test-hasentries'
      );
      return;
    }

    select(`[data-view='create-edit-test']`).setAttribute(
      'data-test-hasentries',
      true
    );

    computePerformanceMatrix();
    select(`[data-candidate-perfs] select`).focus();
  });
};

const buildUI = ({ mode }) => {
  const hasEntries = select('[data-test-hasentries]');
  if (hasEntries) hasEntries.removeAttribute('data-test-hasentries');

  if (builtUI === true) return;

  const viewTitle = select(`[data-view='create-edit-test'] [data-view-title]`);
  viewTitle.textContent =
    mode === 'create' ? 'Create Assessment' : 'Manage Assessment';

  mdc.textField.MDCTextField.attachTo(select('#testname-field'));
  mdc.textField.MDCTextField.attachTo(select('#testcycle-field'));
  mdc.textField.MDCTextField.attachTo(select('#from-date-field'));
  mdc.textField.MDCTextField.attachTo(select('#to-date-field'));

  [
    select('#testname-field input'),
    select('#testcycle-field input'),
    select('#from-date-field input'),
    select('#to-date-field input')
  ].forEach(input => {
    input.addEventListener('blur', fieldValueChanged);
  });

  mdc.select.MDCSelect.attachTo(select('[data-candidate-perfs]'));
  const selectCandidatePerfs = new mdc.select.MDCSelect(
    select('[data-candidate-perfs].mdc-select')
  );
  selectCandidatePerfs.listen('MDCSelect:change', () => {
    filterCandidatesByPerf(selectCandidatePerfs.value);
  });

  select(`button[data-export]`).addEventListener('click', handleExport);

  mode == 'manage' ? searchByEmail() : null;

  saveTestBtn.addEventListener('click', () => {
    saveTest(assessment).then(updated => {
      setAssessmentObject({
        id: updated.id,
        ...updated.data()
      });
    });
  });

  extractTestIDBtn.addEventListener('click', () => {
    if (!assessment || !assessment.id) return;

    const textArea = document.createElement('textarea');
    textArea.setAttribute('id', 'test-id-copyr');
    textArea.value = `https://alc-dev-toolkit-d50fe.firebaseapp.com/${getAssessmentPublicKey()}`;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('Copy');
    textArea.remove();
  });

  SPECS.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const { status, name, challenges } = data;
        if (status !== 'archived') {
          specifications.push({
            id: doc.id,
            name,
            challenges
          });
        }
      });

      render(specsListItemTPL(specifications), select('#select-spec select'));

      rAF({ wait: 1200 }).then(() => {
        const mdcSelect = select('#select-spec');
        const combo = mdcSelect.querySelector('select');

        const first = document.createElement('option');
        first.setAttribute('disabled', 'disabled');
        first.textContent = 'Choose Option';
        combo.insertBefore(first, combo.querySelector('option'));

        const options = combo.querySelectorAll('option');
        const specOption = [...options].find(
          opt => opt.value === assessment.spec
        );

        if (specOption) {
          specOption.setAttribute('selected', 'selected');
        } else {
          first.setAttribute('selected', 'selected');
        }

        // const selectSpec = new MDCSelect(mdcSelect);
        mdc.select.MDCSelect.attachTo(mdcSelect);
        const selectSpec = new mdc.select.MDCSelect(mdcSelect);
        selectSpec.listen('MDCSelect:change', () => {
          if (!selectSpec.value) return;
          assessment.spec = selectSpec.value;
        });
      });
    })
    .catch(console.warn);

  builtUI = true;
};

const adminWillCreateTest = () => {
  setAssessmentObject({});
  buildUI({ mode: 'create' });
  clearInputValues();

  goTo('create-edit-test', {}, '!#create-edit-test');
  if (monitoringCanSaveTest === true) return;

  rAF().then(() => canSaveTest());
};

const manageATest = event => {
  const itemEl = event.target.closest('.mdc-card');
  if (!itemEl) return;

  const id = itemEl.getAttribute('data-key');
  if (!id) return;

  buildUI({ mode: 'manage' });
  clearInputValues();

  ASSESSMENTS.doc(id)
    .get()
    .then(doc => {
      setAssessmentObject({
        id: doc.id,
        ...doc.data()
      });
      resetDataAndChart();

      [
        select('#testname-io'),
        select('#testcycle-io'),
        select('#from-date'),
        select('#to-date'),
        select('#select-spec select')
      ].forEach(field => {
        const key = field.getAttribute('data-field');
        if (key && assessment[key]) {
          field.value = assessment[key];
        }
        field.focus();
      });

      attemptDisplayAssessmentAdminUI();

      // query('submissions', [
      //   'email == chaluwa@gmail.com',
      //   `assessment == ${assessment.publicKey}`
      // ]).then(snap => {
      //   snap.forEach(s => console.log(s.data()));
      //   SUBMISSIONS.doc( snap.docs[0].id ).delete().then(() => {
      //     console.log('deleted chaluwa');
      //   });
      // });
    });

  goTo('create-edit-test', { id }, '!#create-edit-test');
  if (monitoringCanSaveTest === true) return;

  rAF().then(() => canSaveTest());
};

const testsListItemTPL = specs => html`
  ${specs.map(
    item => html`
      <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-2">
        <div
          class="mdc-card text-only"
          data-key=${item.id}
          @click=${manageATest}
        >
          <div class="mdc-card__primary-action" tabindex="0">
            <h2 class="mdc-typography--headline6">
              ${item.name} ${item.cycle}
            </h2>
            <div class="mdc-typography--body2"></div>
          </div>
        </div>
      </div>
    `
  )}
`;

export const adminWillViewTests = () => {
  ASSESSMENTS.get()
    .then(snapshot => {
      const tests = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const { status } = data;
        if (status !== 'archived') {
          tests.push({
            id: doc.id,
            ...data
          });
        }
        render(testsListItemTPL(tests), testsListEl);
      });
    })
    .catch(console.warn);

  goTo('assessments', {}, '!#assessments');

  [...selectAll('.mdc-chip-set')].forEach(chip => {
    mdc.chips.MDCChip.attachTo(chip);
  });
  select('[data-action=add-test]').addEventListener(
    'click',
    adminWillCreateTest
  );
};

export default { adminWillViewTests };
