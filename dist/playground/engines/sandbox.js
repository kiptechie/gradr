let specId;
let parentWindow;

const executeScript = code =>
  new Promise(resolve => {

    let ast = esprima.parseScript(code);
    if(gradrInstrumentation && typeof gradrInstrumentation === 'function') {
      ast = gradrInstrumentation(ast);
    }

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
  if(gradr && typeof gradr === 'function') {
    gradr(payload)
    .then(({ completedChallenge }) => {
      const done = completedChallenge + 1;
      const msg = `Greate Job Completing Challenge ${done}. Your App Should Be Functional`;
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
    if (!specId) {
      specId = event.data.spec;

      const script = document.createElement('script');
      script.setAttribute(
        'src',
        `${window.location.origin}/engines/${specId}.js`
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
