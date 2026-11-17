'use client';

import { createContext } from 'react';

/** Cờ `<Form>` cấp xuống mọi field bên trong; đọc bằng `useFormMeta()`. */
export interface FormMeta {
  readOnly: boolean;
  autoSave: boolean;
}

export const FormMetaContext = createContext<FormMeta>({ readOnly: false, autoSave: false });

export const FormMetaProvider = FormMetaContext.Provider;
