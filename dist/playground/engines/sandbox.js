let specId;
let parentWindow;
const noAutoGradrErrorMsg =
  'auto-grading for this assessment is not yet available';
const relay = data => {
  parentWindow.postMessage(data, window.location.origin);
};

const executeScript = code =>
  new Promise((resolve, reject) => {
    let ast;
    try {
      ast = esprima.parseScript(code);
    } catch (error) {
      reject(Error('Awwww Snaaap :( your javascript code has one or more syntax errors ...'));
    }

    if(!ast) return;

    if('undefined' !== typeof gradrInstrumentation) {
      // TODO rename this to 
      // gradrCodemod
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
  new Promise((resolve, reject) => {
    const styles = document.head.querySelector('#styles');

    csstree.parse(code, {
      onParseError: (error) => {
        reject(Error('Awwww Snaaap :( your CSS code has one or more syntax errors ...'));
      }
    });

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
  if (typeof gradr === 'undefined') {
    relay({
      feedback: { message: noAutoGradrErrorMsg }
    });
    return;
  }

  if (typeof gradr === 'function') {
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

const installAutoGrader = event =>
  new Promise((resolve, reject) => {
    if (specId) return resolve();

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
        script.onload = resolve;
        document.body.appendChild(script);
        script.src = `${autoGradrURL}`;

        // setup gradr as a client to the SW
        if(navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'ping'
          });
        }

      })
      .catch(error => {
        reject(new Error(noAutoGradrErrorMsg));
      });
  });

const playCode = event => {
  parentWindow = window.parent;
  if (event.source !== parentWindow) return;

  const { styles, script, markup } = event.data.payload;
  installAutoGrader(event)
    .then(() => executeMarkup(markup))
    .then(() => executeStyle(styles))
    .then(() => executeScript(script))
    .then(() => runAudits({ styles, markup, script }))
    .catch(({message}) => {
      relay({
        feedback: { message }
      });
    });
};

window.addEventListener('message', playCode);
