import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import language from './monaco-lang';

// set monaco web workers url
window.MonacoEnvironment = {
  getWorkerUrl: (moduleId, label)=> {
		if (label === 'json') {
			return '../language/json/json.worker.js';
		}
		if (label === 'css') {
			return '../language/css/css.worker.js';
		}
		if (label === 'html') {
			return '../language/html/html.worker.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return '../language/typescript/ts.worker.js';
		}
		return '../editor/editor.worker.js';
  }
};

/**
 * @param {object} doc - the section of the dom where monaco editor is to be implemented
 * @param {object} MonacoConfig - a configuration object for the look and feel of monaco
 * @example
 * // const doc = document.getElementById('monacoSpace')
 * //
 * // const monacoConfig = {
 * // language: 'ruby',
 * // theme: "vs dark",
 * // fontWeight: "bold",
 * // }
 *
 * @returns {function} - Returns an instance of monaco editor
 */
const monacoCreate = (MonacoConfig = {}, doc) => monaco.editor.create(doc, {
  value: [
    'function x() {',
    '\tconsole.log("Hello world!");',
    '}'
  ].join('\n'),
  language: language.javascript,
  theme: "white",
  mouseWheelZoom: true,
  readOnly: false,
  showUnused: true,
  wordWrap: "on",
  selectionClipboard: false,
  ...MonacoConfig
});

/**
 * @param {object} monacoEditor - an existing instance of the monaco editor
 * @returns {string} - returns all codes written in the monaco editor
 */
const getValue = (monacoEditor) => monacoEditor.getValue()

export {
  monacoCreate,
  getValue
};
