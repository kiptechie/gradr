let assessmentId;
let parentWindow;

const executeScript = code =>
  new Promise(resolve => {
    // TODO proceed only after linting
    // TODO prevent infinite loops
    // TODO convert root const / let declarations to var

    const ast = esprima.parseScript(code);
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
  const gradr = gradr || window.gradr;

  if(gradr && typeof gradr === 'function') {
    gradr(payload)
    .then(({ completedChallenge }) => {
      const msg = `Greate Job. You Have Completed Challenge ${completedChallenge +
        1}. Your App Should Be Functional`;
      parentWindow.postMessage(
        {
          feedback: {
            message: msg,
            completedChallenge
          }
        },
        window.location.origin
      );
    })
    .catch(({ message }) => {
      parentWindow.postMessage(
        {
          feedback: { message }
        },
        window.location.origin
      );
    });
  } else {
    console.warn('This assessment does not yet have an auto-grader!');
  }
};

const installAssessment = event =>
  new Promise((resolve, reject) => {
    if (!assessmentId) {
      assessmentId = event.data.assessment;

      const script = document.createElement('script');
      script.setAttribute(
        'src',
        `${window.location.origin}/engines/${assessmentId}.js`
      );
      script.onerror = reject;
      script.onload = resolve;
      document.body.appendChild(script);
      return;
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
