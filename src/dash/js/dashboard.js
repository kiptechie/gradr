import { select, goTo } from '../../commons/js/utils.js';
import { importSpecs, importTests } from './module-manager.js';

const buildUI = (user) => {
  mdc.topAppBar.MDCTopAppBar.attachTo(select('.mdc-top-app-bar'));
  select('body').setAttribute('data-auth', 'authenticated');

  select(`[data-action='totests']`).addEventListener('click', (event) => {
    event.preventDefault();
    importTests().then(tests => {
      tests.adminWillViewTests();
    });
  });

  select(`[data-action='tospecs']`).addEventListener('click', (event) => {
    event.preventDefault();
    importSpecs().then(specs => {
      specs.adminWillViewSpecs();
    });
  });

};

export const enter = (user) => {
  goTo('dash');
  buildUI(user);
};

export default { enter };
