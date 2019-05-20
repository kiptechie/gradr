import firebase from "firebase/app";

import { html, render } from "lit-html";

import {
  select,
  selectAll,
  goTo,
  rAF,
  toSlug,
  loadCodemirrorAssets,
  trim,
  exceptId
} from "../../commons/js/utils.js";

let spec;
let codeEditor;
let builtUI = false;
let activeChallengeIndex = -1;

const SPECS = firebase.firestore().collection("specs");

const specsListEl = select("#specs-list");
const saveSpecBtn = select(`[data-action='save-spec']`);
const specNameField = select("#specname-field");
const specAboutField = select("#specabout-field");
const challengeListEl = select("#challenge-list");

const selectAChallenge = event => {
  const item = event.target.closest("li");
  if (!item) return;

  const pos = item.getAttribute("data-item-index");
  const challenge = spec.challenges[pos];
  if (!challenge) return;

  const challengeDetailsWrap = select(`[data-manage-challenge]`);
  challengeDetailsWrap.setAttribute("data-manage-challenge", "on");
  challengeDetailsWrap.setAttribute("data-manage-challenge-mode", "edit");

  activeChallengeIndex = pos;
  codeEditor.setValue(challenge.guide);
};

const challengeListItemTPL = challenges => {
  return html`
    ${
      challenges.map(
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
      )
    }
  `;
};

const extriesAreValid = () =>
  spec &&
  trim(spec.name) !== "" &&
  trim(spec.about) !== "" &&
  Array.isArray(spec.challenges);

const canSaveSpec = () => {
  if (extriesAreValid() === true) {
    saveSpecBtn.removeAttribute("disabled");
  } else {
    saveSpecBtn.setAttribute("disabled", true);
  }

  rAF({ wait: 2000 }).then(queue => queue(canSaveSpec));
};

const clearInputValues = () => {
  spec = {};
  if(codeEditor) codeEditor.setValue("");
  render(challengeListItemTPL([]), challengeListEl);

  [
    select("#specname-field input"),
    select("#specabout-field input")
  ].forEach(input => {
    const field = input;
    field.value = "";
  });
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
    status: "active",
    type: "mini-app",
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
  // TODO check backend if name is unique, else flag
};

const specAboutChanged = event => {
  spec.about = event.target.value;
};

const addAChallenge = () => {
  const challengeDetailsWrap = select(`[data-manage-challenge]`);
  challengeDetailsWrap.setAttribute("data-manage-challenge", "on");
  challengeDetailsWrap.setAttribute("data-manage-challenge-mode", "create");

  activeChallengeIndex = -1;
  codeEditor.setValue("### Challenge Title");
};

const saveAChallenge = () => {
  const guide = codeEditor.getValue();
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

const buildUI = mode => {
  if (builtUI === true) return;

  const viewTitle = select(`[data-view='create-edit-spec'] [data-view-title]`);
  viewTitle.textContent = mode === "create" ? "Create Spec" : "Manage Spec";

  mdc.textField.MDCTextField.attachTo(specNameField);
  specNameField
    .querySelector("input")
    .addEventListener("blur", specNameChanged);

  mdc.textField.MDCTextField.attachTo(specAboutField);
  specAboutField
    .querySelector("input")
    .addEventListener("blur", specAboutChanged);

  mdc.list.MDCList.attachTo(challengeListEl);
  const challengeList = new mdc.list.MDCList.attachTo(challengeListEl);
  challengeList.singleSelection = true;
  challengeList.listElements.map(listItemEl => new MDCRipple(listItemEl));

  rAF({wait: 1500}).then(() => {
    select(`[data-action='add-challenge']`).addEventListener(
      "click",
      addAChallenge
    );
  
    select(`[data-action='save-challenge']`).addEventListener(
      "click",
      saveAChallenge
    );
  });

  saveSpecBtn.addEventListener("click", () => {
    saveSpec(spec).then(updated => {
      spec = {
        id: updated.id,
        ...updated.data()
      };
    });
  });

  loadCodemirrorAssets({
    mode: "markdown"
  }).then(() => {
    codeEditor = CodeMirror(select("#challenge-instructions"), {
      theme: "idea",
      autofocus: true,
      lineWrapping: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: { name: "markdown", highlightFormatting: true }
    });
  });

  builtUI = true;
};

const adminWillCreateSpec = () => {
  buildUI({ mode: "create" });
  clearInputValues();

  goTo("create-edit-spec");
  rAF().then(queue => queue(canSaveSpec));
};

const manageASpec = event => {
  const itemEl = event.target.closest(".mdc-card");
  if (!itemEl) return;

  const id = itemEl.getAttribute("data-key");
  if (!id) return;

  SPECS.doc(id)
    .get()
    .then(doc => {
      spec = {
        id: doc.id,
        ...doc.data()
      };

      const nameInput = specNameField.querySelector("input");
      nameInput.value = spec.name;
      nameInput.focus();

      const aboutInput = specAboutField.querySelector("input");
      aboutInput.value = spec.about || '';
      aboutInput.focus();

      render(challengeListItemTPL(spec.challenges), challengeListEl);
      challengeListEl.querySelector("li").click();
    });

  buildUI({ mode: "manage" });

  select(`[data-view='create-edit-spec'] [data-view-title]`).textContent =
    "Manage A Spec";
  goTo("create-edit-spec", { id });
};

const specsListItemTPL = specs => {
  return html`
    ${
      specs.map(
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
      )
    }
  `;
};

export const adminWillViewSpecs = () => {
  SPECS.where("status", "==", "active")
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

  goTo("specs");

  [...selectAll('.mdc-chip-set')].forEach(chip => {
    mdc.chips.MDCChip.attachTo(chip);
  });
  select("[data-action=add-spec]").addEventListener(
    "click",
    adminWillCreateSpec
  );
};

export default { adminWillViewSpecs };

/*

*/
