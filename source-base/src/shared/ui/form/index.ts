/**
 * Hệ form: Form, FormItem, field, bố cục, mẫu và hook — code ngoài UI kit import qua `@/shared/ui`.
 * Code nội bộ form import tương đối thẳng tới file cùng nhóm.
 */

export * from './fields';
export * from './layout';
export * from './patterns';
export * from './hooks';
export { default as Form } from './Form';
export type { FormProps, AutoSaveOptions, DirtyGuardOptions } from './Form';
export { default as FormItem } from './FormItem';
export type { FormItemProps, ErrorColor } from './FormItem';
export type { FormMeta } from './form.context';
