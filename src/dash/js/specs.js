import firebase from 'firebase/app';

import marked from 'marked';
import { html, render } from "lit-html";
import { monacoCreate } from '../../commons/js/monaco-init.js';
import language from '../../commons/js/monaco-lang';

import {
  select,
  selectAll,
  goTo,
  rAF,
  toSlug,
  trim,
  exceptId
} from '../../commons/js/utils.js';

let spec = {};
let builtUI = false;
let starterEditor;
let instructionsEditor;
let activeChallengeIndex = -1;

const SPECS = firebase.firestore().collection('specs');

const specsListEl = select('#specs-list');
const saveSpecBtn = select(`[data-action='save-spec']`);
const specNameField = select('#specname-field');
const specAboutField = select('#specabout-field');
const specDifficultyField = select('#specdifficulty-field');
const challengeListEl = select('#challenge-list');

const deleteSpecIcon = select(`[data-action='delete-spec']`);
const deleteConfirmBtn = select(`[data-action='delete-confirm']`);
const deleteDialogComponent = select(`[data-action='delete-dialog']`);
const cancelDeleteBtn = select(`[data-mdc-dialog-action='close']`);
const deleteDialogScrim = select('.mdc-dialog__scrim');

const deleteSpec = () => {
  if (!spec || !spec.id) return;
  SPECS.doc(spec.id)
    .delete()
    .then(() => {
      // TODO notify user
      window.location.pathname = '!#specs';
    })
    .catch(error => {
      // TODO notify user
      console.warn('Error deleting spec: ', error.message);
    });
};

const closeDeleteDialog = () => {
  deleteDialogComponent.classList.remove('mdc-dialog--open');
  cancelDeleteBtn.removeEventListener('click', closeDeleteDialog);
  deleteDialogScrim.removeEventListener('click', closeDeleteDialog);
  deleteConfirmBtn.removeEventListener('click', deleteSpec);
};

const openDeleteDialog = () => {
  if (!spec || !spec.id) return;
  deleteDialogComponent.classList.add('mdc-dialog--open');
  cancelDeleteBtn.addEventListener('click', closeDeleteDialog);
  deleteDialogScrim.addEventListener('click', closeDeleteDialog);
  deleteConfirmBtn.addEventListener('click', deleteSpec);
};

const switchDetailsTo = attr => {
  const node = select(`[${attr}]`);
  if (!node) return;

  if (node.getAttribute(`${attr}`) !== 'active') {
    [...selectAll(`[data-details-item]`)].forEach(item => {
      item.setAttribute('data-details-item', 'off');
    });
  }

  node.setAttribute('data-details-item', 'active');
};

const selectAChallenge = event => {
  const item = event.target.closest('li');
  if (!item) return;

  const pos = item.getAttribute('data-item-index');
  const challenge = spec.challenges[pos];
  if (!challenge) return;

  switchDetailsTo(`data-manage-challenge-instructions`);

  activeChallengeIndex = pos;
  instructionsEditor.setValue(challenge.guide);
  select('#toggle-viewer').classList.remove('mdc-icon-button--on');
};

const challengeListItemTPL = challenges => {
  return html`
    ${challenges.map(
      (item, index) => html`
        <li
          class="mdc-list-item"
          tabindex="0"
          @click=${selectAChallenge}
          data-item-index=${index}
        >
          <span class="mdc-list-item__text">
            <span class="mdc-list-item__primary-text">${item.title}</span>
            <span class="mdc-list-item__secondary-text"
              >Challenge <span class="ch-index">${index + 1}</span></span
            >
          </span>
        </li>
      `
    )}
  `;
};

const extriesAreValid = () =>
  spec &&
  trim(spec.name) !== '' &&
  trim(spec.about) !== '' &&
  spec.difficulty !== undefined &&
  Array.isArray(spec.challenges);

const canSaveSpec = () => {
  if (extriesAreValid() === true) {
    saveSpecBtn.removeAttribute('disabled');
  } else {
    saveSpecBtn.setAttribute('disabled', true);
  }

  rAF({ wait: 2000 }).then(() => canSaveSpec());
};

const clearInputValues = () => {
  spec = {};
  if (instructionsEditor) instructionsEditor.setValue('');
  render(challengeListItemTPL([]), challengeListEl);

  select('.mdc-select__selected-text').innerHTML = '';
  const instructionsTemplate = select('[data-manage-challenge-instructions]');
  if (instructionsTemplate) {
    instructionsTemplate.setAttribute('data-details-item', 'off');
  }

  [select('#specname-field input'), select('#specabout-field input')].forEach(
    input => {
      const field = input;
      field.value = '';
    }
  );
};

const saveSpec = details => {
  const { id } = details;
  if (id) {
    const changes = exceptId(details);
    return SPECS.doc(id)
      .update(changes)
      .then(() => SPECS.doc(id))
      .then(doc => doc.get());
  }

  return SPECS.add({
    ...details,
    status: 'active',
    type: 'mini-app',
    createAt: Date.now()
  })
    .then(ref => SPECS.doc(ref.id))
    .then(doc => doc.get());
};

const specNameChanged = event => {
  spec.name = event.target.value;
  if (spec.name) {
    spec.slug = toSlug(spec.name);
  }
  // TODO check backend if slug is unique, else flag
};

const specAboutChanged = event => {
  spec.about = event.target.value;
};

const specDifficultyChanged = event => {
  const target = event.currentTarget.querySelector('input');
  spec.difficulty = target.value;
};

const addAChallenge = () => {
  switchDetailsTo(`data-manage-challenge-instructions`);
  activeChallengeIndex = -1;
  instructionsEditor.setValue('### Challenge Title');
};

const saveAChallenge = () => {
  const guide = instructionsEditor.getValue();
  const value = guide && guide.match(/^\s*#{3}\s+(.*)/);
  if (value && Array.isArray(value) && value[1]) {
    const title = value[1];
    if (activeChallengeIndex < 0) {
      spec.challenges = spec.challenges || [];
      spec.challenges.push({ title, guide });
      activeChallengeIndex = spec.challenges.length - 1;
    } else {
      spec.challenges[activeChallengeIndex] = { title, guide };
    }
  }

  render(challengeListItemTPL(spec.challenges), challengeListEl);
};

const authorStarter = async () => {
  switchDetailsTo(`data-manage-challenge-starter`);
  let code = spec.starterCodebase;
  if (!code) {
    code = await import('../../commons/tpl/start.html');
  }
  starterEditor.setValue(code);
};

const saveStarter = () => {
  const starterCode = starterEditor.getValue();
  if (starterCode && trim(starterCode) !== '') {
    spec.starterCodebase = starterCode;
    // TODO render it into a preview container
  }
};

const renderStarter = () => { };

const renderInstructions = () => {
  const instructions = spec.challenges.reduce((all, { guide }) => `${all} \n\n ${guide}`, '');
  select(`[data-preview='challenge-instructions'] .content`).innerHTML = marked(instructions, {
    gfm: true,
    smartLists: true
  });
};

const togglePreviewEditModes = event => {
  const activeNode = select(`[data-details-item='active']`);
  if (!activeNode) return;

  const inPreviewMode = activeNode.hasAttribute('data-preview');
  if (inPreviewMode) {
    const key = activeNode.getAttribute('data-preview');

    renderStarter();
    switchDetailsTo(`data-manage-${key}`);
  } else {
    const modeNode = activeNode.querySelector(`div[id]`);
    const modeKey = modeNode.getAttribute('id');

    const previewQry = `data-preview=${modeKey}`;
    const previewNode = select(`[${previewQry}]`);
    if (!previewNode) return;

    renderInstructions();
    switchDetailsTo(previewQry);
  }

  select('#toggle-viewer').classList.toggle('mdc-icon-button--on');
};

const buildUI = mode => {
  if (builtUI === true) return;

  const viewTitle = select(`[data-view='create-edit-spec'] [data-view-title]`);
  viewTitle.textContent = mode === 'create' ? 'Create Spec' : 'Manage Spec';

  mdc.textField.MDCTextField.attachTo(specNameField);
  specNameField
    .querySelector('input')
    .addEventListener('blur', specNameChanged);

  mdc.textField.MDCTextField.attachTo(specAboutField);
  specAboutField
    .querySelector('input')
    .addEventListener('blur', specAboutChanged);

  mdc.select.MDCSelect.attachTo(specDifficultyField);
  specDifficultyField.addEventListener(
    'MDCSelect:change',
    specDifficultyChanged
  );

  mdc.list.MDCList.attachTo(challengeListEl);
  const challengeList = new mdc.list.MDCList.attachTo(challengeListEl);
  challengeList.singleSelection = true;
  challengeList.listElements.map(listItemEl => new MDCRipple(listItemEl));

  rAF({ wait: 1500 }).then(() => {
    select(`[data-action='add-challenge']`).addEventListener(
      'click',
      addAChallenge
    );

    select(`[data-action='save-challenge']`).addEventListener(
      'click',
      saveAChallenge
    );

    select(`[data-action='set-starter-code']`).addEventListener(
      'click',
      authorStarter
    );

    select(`[data-action='save-starter']`).addEventListener(
      'click',
      saveStarter
    );

    select('#toggle-viewer').addEventListener('click', togglePreviewEditModes);
  });

  saveSpecBtn.addEventListener('click', () => {
    saveSpec(spec).then(updated => {
      spec = {
        id: updated.id,
        ...updated.data()
      };
    });
  });

  // setup monaco for challenge instructions
  instructionsEditor = monacoCreate({ language: language.markdown }, select("#challenge-instructions"));

  // setup monaco for challenge instructions
  starterEditor = monacoCreate({ language: language.javascript }, select("#challenge-starter"));

  builtUI = true;
};

const adminWillCreateSpec = () => {
  buildUI({ mode: 'create' });
  clearInputValues();

  goTo('create-edit-spec');
  rAF().then(() => canSaveSpec());
};

const manageDifficultySelection = difficulty => {
  const selectedTextNodes = [
    ...selectAll('.specdifficulty-ul .mdc-list-item--selected')
  ];
  const difficultyInput = specDifficultyField.querySelector('input');
  const difficultyOption = select(`[data-value=${difficulty}]`);
  const selectedText = specDifficultyField.querySelector(
    '.mdc-select__selected-text'
  );

  selectedTextNodes.map(node =>
    node.classList.remove('mdc-list-item--selected')
  );

  difficultyInput.value = difficulty;
  difficultyOption.classList.add('mdc-list-item--selected');
  difficultyOption.setAttribute('aria-selected', 'true');
  selectedText.innerHTML = `${difficulty
    .charAt(0)
    .toUpperCase()}${difficulty.slice(1)}`;
  selectedText.focus();
};

const manageASpec = event => {
  const itemEl = event.target.closest('.mdc-card');
  if (!itemEl) return;

  const id = itemEl.getAttribute('data-key');
  if (!id) return;

  SPECS.doc(id)
    .get()
    .then(doc => {
      spec = {
        id: doc.id,
        ...doc.data()
      };

      const nameInput = specNameField.querySelector('input');
      nameInput.value = spec.name;
      nameInput.focus();

      const aboutInput = specAboutField.querySelector('input');
      aboutInput.value = spec.about || '';
      aboutInput.focus();

      let difficulty = 'beginner';
      if (spec.difficulty) ({ difficulty } = spec);
      manageDifficultySelection(difficulty);

      render(challengeListItemTPL(spec.challenges), challengeListEl);
      challengeListEl.querySelector('li').click();
    });

  buildUI({ mode: 'manage' });

  select(`[data-view='create-edit-spec'] [data-view-title]`).textContent =
    'Manage A Spec';
  goTo('create-edit-spec', { id });
};

const specsListItemTPL = specs => {
  return html`
    ${specs.map(
      item => html`
        <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-2">
          <div
            class="mdc-card text-only"
            data-key=${item.id}
            @click=${manageASpec}
          >
            <div class="mdc-card__primary-action" tabindex="0">
              <h2 class="mdc-typography--headline6">${item.name}</h2>
              <div class="mdc-typography--body2">${item.about}</div>
            </div>
          </div>
        </div>
      `
    )}
  `;
};

export const adminWillViewSpecs = () => {
  SPECS.where('status', '==', 'active')
    .get()
    .then(snapshot => {
      const specs = [];
      snapshot.forEach(doc => {
        specs.push({
          id: doc.id,
          ...doc.data()
        });
        render(specsListItemTPL(specs), specsListEl);
      });
    })
    .catch(console.warn);

  goTo('specs');

  [...selectAll('.mdc-chip-set')].forEach(chip => {
    mdc.chips.MDCChip.attachTo(chip);
  });
  select('[data-action=add-spec]').addEventListener(
    'click',
    adminWillCreateSpec
  );
};

export default { adminWillViewSpecs };
