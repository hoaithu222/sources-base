import { appConfig } from '@/core/config';

/** Tên ứng dụng — nguồn duy nhất là `NEXT_PUBLIC_APP_NAME` trong `.env`; đừng hardcode ở nơi khác. */
export const APP_NAME = appConfig.appName;
