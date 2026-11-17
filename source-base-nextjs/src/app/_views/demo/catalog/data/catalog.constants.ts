import type { CatalogGroup } from './catalog.types';

/**
 * Dữ liệu tra cứu của catalog `/demo` — thứ tự nhóm, tên component, dòng import, file nguồn, tài liệu.
 * Chữ (tiêu đề, mô tả) ở `messages/<locale>/demo.json` → `groups.<id>`; thêm nhóm: thêm id vào `CATALOG_GROUP_ORDER`,
 * một khoá ở `CATALOG_GROUPS`, hai khoá dịch, một component `<Id>Catalog` và một dòng ở `DemoLibraryView`.
 */

export const CATALOG_GROUP_ORDER = [
  'button',
  'form',
  'select',
  'pickers',
  'overlays',
  'table',
  'badge',
  'feedback',
  'progress',
  'controls',
] as const;

export type CatalogGroupId = (typeof CATALOG_GROUP_ORDER)[number];

const UI = '@/shared/ui';

export const CATALOG_GROUPS = {
  button: {
    components: ['Button'],
    imports: [
      { from: UI, names: ['Button'] },
      { from: '@/shared/ui/icons/Icons', names: ['SystemIcon'] },
    ],
    sources: ['src/shared/ui/actions/Button.tsx'],
    docs: [
      'docs/rules/structure/reuse-first.md',
      'docs/rules/interaction/navigable-controls.md',
      'docs/notes/components/actions.md',
    ],
  },
  form: {
    components: ['Form', 'TextField', 'PasswordField', 'NumberField', 'FormActions'],
    imports: [
      {
        from: UI,
        names: ['Form', 'TextField', 'PasswordField', 'NumberField', 'FormActions', 'useZodForm'],
      },
    ],
    sources: [
      'src/shared/ui/form/Form.tsx',
      'src/shared/ui/form/fields/text/TextField.tsx',
      'src/shared/ui/form/fields/text/PasswordField.tsx',
      'src/shared/ui/form/fields/text/NumberField.tsx',
      'src/shared/ui/form/layout/FormActions.tsx',
    ],
    docs: ['docs/rules/data/form-validation.md', 'docs/notes/components/form.md'],
  },
  select: {
    components: ['Dropdown', 'MultiSelect'],
    imports: [{ from: UI, names: ['Dropdown', 'MultiSelect'] }],
    sources: [
      'src/shared/ui/selects/dropdown/Dropdown.tsx',
      'src/shared/ui/selects/multi-select/MultiSelect.tsx',
    ],
    docs: ['docs/rules/interaction/search-matching.md', 'docs/notes/components/selects.md'],
  },
  pickers: {
    components: ['SingleDatePicker', 'DateTimePicker', 'TimePicker', 'DatePicker'],
    imports: [{ from: UI, names: ['SingleDatePicker', 'DateTimePicker', 'TimePicker'] }],
    sources: [
      'src/shared/ui/pickers/date/SingleDatePicker.tsx',
      'src/shared/ui/pickers/date/date-time-picker/DateTimePicker.tsx',
      'src/shared/ui/pickers/time/TimePicker.tsx',
    ],
    docs: ['docs/rules/i18n/i18n.md', 'docs/notes/components/pickers.md'],
  },
  overlays: {
    components: ['Modal', 'ConfirmDialog', 'FormModal', 'Toast', 'showToast'],
    imports: [
      { from: UI, names: ['Modal', 'ConfirmDialog', 'FormModal', 'showToast'] },
      { from: '@/shared/hooks', names: ['useDisclosure'] },
    ],
    sources: [
      'src/shared/ui/overlays/dialog/Modal.tsx',
      'src/shared/ui/overlays/dialog/confirm-dialog/ConfirmDialog.tsx',
      'src/shared/ui/overlays/dialog/FormModal.tsx',
      'src/shared/ui/overlays/toast/toast.api.ts',
    ],
    docs: ['docs/rules/data/form-validation.md', 'docs/notes/components/overlays.md'],
  },
  table: {
    components: ['Table', 'Pagination'],
    imports: [{ from: UI, names: ['Table'] }],
    sources: ['src/shared/ui/data-display/table/Table.tsx'],
    docs: ['docs/rules/display/data-entry-table.md', 'docs/notes/components/data-display-table.md'],
  },
  badge: {
    components: ['Badge', 'Avatar'],
    imports: [{ from: UI, names: ['Badge', 'Avatar'] }],
    sources: ['src/shared/ui/primitives/Badge.tsx', 'src/shared/ui/primitives/Avatar.tsx'],
    docs: ['docs/rules/styling/color-usage-guide.md', 'docs/notes/components/primitives.md'],
  },
  feedback: {
    components: ['Callout', 'EmptyState'],
    imports: [{ from: UI, names: ['Callout', 'EmptyState'] }],
    sources: ['src/shared/ui/feedback/Callout.tsx', 'src/shared/ui/feedback/EmptyState.tsx'],
    docs: ['docs/notes/components/feedback.md'],
  },
  progress: {
    components: ['Progress', 'ProgressCircle', 'Spinner', 'Skeleton'],
    imports: [{ from: UI, names: ['Progress', 'ProgressCircle', 'Spinner', 'Skeleton'] }],
    sources: [
      'src/shared/ui/feedback/Progress.tsx',
      'src/shared/ui/feedback/ProgressCircle.tsx',
      'src/shared/ui/feedback/Spinner.tsx',
      'src/shared/ui/feedback/Skeleton.tsx',
    ],
    docs: ['docs/notes/components/feedback.md'],
  },
  controls: {
    components: ['Toggle', 'SegmentToggle', 'Checkbox'],
    imports: [{ from: UI, names: ['Toggle', 'SegmentToggle', 'Checkbox'] }],
    sources: [
      'src/shared/ui/inputs/Toggle.tsx',
      'src/shared/ui/actions/segment-toggle/SegmentToggle.tsx',
      'src/shared/ui/inputs/Checkbox.tsx',
    ],
    docs: ['docs/notes/components/inputs.md', 'docs/notes/components/actions.md'],
  },
} as const satisfies Record<CatalogGroupId, CatalogGroup>;
