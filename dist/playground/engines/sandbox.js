let specId;
let parentWindow;
const noAutoGradrErrorMsg = 'auto-grading for this assessment is not yet available';
const relay = (data) => {
  parentWindow.postMessage(
    data, window.location.origin
  );
};

const executeScript = code =>
  new Promise(resolve => {

    let ast = esprima.parseScript(code);
    let gradrInstrumentation = program => program;
    
    ast = gradrInstrumentation(ast);
    for (let node of ast.body) {
      if (node.type === 'VariableDeclaration') {
        node.kind = 'var';
      }
    }

    const codeToRun = escodegen.generate(ast);
    const script = document.body.querySelector('#codesink');
    if (script) {
      script.remove();
    }

    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('id', 'codesink');
    scriptTag.textContent = codeToRun;
    document.body.appendChild(scriptTag);
    resolve();
  });

const executeStyle = code =>
  new Promise(resolve => {
    const styles = document.head.querySelector('#styles');

    styles.textContent = code;
    resolve();
  });

const executeMarkup = code =>
  new Promise(resolve => {
    const wrap = document.querySelector('#markup-wrap');
    wrap.innerHTML = code;
    resolve();
  });

const runAudits = payload => {
  if('undefined' === typeof gradr) {
    relay({
      feedback: { message:noAutoGradrErrorMsg }
    });
    return;
  };

  if('function' === typeof gradr) {
    gradr(payload)
    .then(({ completedChallenge }) => {
      const done = completedChallenge + 1;
      const msg = `Greate Job Completing Challenge ${done}. Your App Should Be Functional`;
      relay({
        feedback: {
          message: msg,
          completedChallenge
        }
      });
    })
    .catch(({ message }) => {
      relay({
        feedback: { message }
      });
    });
  }
};

const installAssessment = event =>
  new Promise((resolve, reject) => {
    if (!specId) {
      specId = event.data.spec;
      const autoGradrURL = `${window.location.origin}/engines/${specId}.js`;

      // check if auto-grading script exists
      // else, throw an error in the parse attempt
      fetch(autoGradrURL)
      .then(response => response.text())
      .then(code => {
        esprima.parseScript(code);

        // install auto-grading script
        const script = document.createElement('script');
        document.body.appendChild(script);
        script.src = `${autoGradrURL}`;
        resolve();
      })
      .catch(error => {
        reject(new Error(noAutoGradrErrorMsg));
      });
    }
    resolve();
  });

const playCode = event => {
  parentWindow = window.parent;
  if (event.source !== parentWindow) return;

  const { styles, script, markup } = event.data.payload;
  installAssessment(event)
    .then(() => executeMarkup(markup))
    .then(() => executeStyle(styles))
    .then(() => executeScript(script))
    .then(() => runAudits({ styles, markup, script }));
};

window.addEventListener('message', playCode);
