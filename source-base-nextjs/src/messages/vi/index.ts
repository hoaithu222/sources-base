import about from './about.json';
import account from './account.json';
import auth from './auth.json';
import common from './common.json';
import customers from './customers.json';
import demo from './demo.json';
import errors from './errors.json';
import landing from './landing.json';
import metadata from './metadata.json';
import shell from './shell.json';
import site from './site.json';
import uiActions from './ui.actions.json';
import uiCommon from './ui.common.json';
import uiDataDisplay from './ui.dataDisplay.json';
import uiFeedback from './ui.feedback.json';
import uiForm from './ui.form.json';
import uiInputs from './ui.inputs.json';
import uiLayout from './ui.layout.json';
import uiMedia from './ui.media.json';
import uiNavigation from './ui.navigation.json';
import uiOverlays from './ui.overlays.json';
import uiPickers from './ui.pickers.json';
import uiPrimitives from './ui.primitives.json';
import uiSelects from './ui.selects.json';
import uiSurfaces from './ui.surfaces.json';
import uiUtils from './ui.utils.json';
import uiWidgets from './ui.widgets.json';
import validation from './validation.json';

/**
 * Thông điệp tiếng Việt — NGUỒN: kiểu `Messages` suy từ file này; `en/index.ts` phải khớp từng khoá.
 * Thêm file JSON mới → import + gắn vào đây (và ở `en/index.ts`). Hướng dẫn: `docs/guides/i18n.md`.
 */
const ui = {
  common: uiCommon,
  actions: uiActions,
  dataDisplay: uiDataDisplay,
  feedback: uiFeedback,
  form: uiForm,
  inputs: uiInputs,
  layout: uiLayout,
  media: uiMedia,
  navigation: uiNavigation,
  overlays: uiOverlays,
  pickers: uiPickers,
  primitives: uiPrimitives,
  selects: uiSelects,
  surfaces: uiSurfaces,
  utils: uiUtils,
  widgets: uiWidgets,
};

const messages = {
  about,
  account,
  auth,
  common,
  customers,
  demo,
  errors,
  landing,
  metadata,
  shell,
  site,
  ui,
  validation,
};

export default messages;
