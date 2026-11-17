/** Sinh tự động từ colors.json. ⛔ ĐỪNG SỬA TAY. */

export type ThemeColorKey =
  | 'primary-1'
  | 'primary-2'
  | 'primary-3'
  | 'primary-4'
  | 'primary-5'
  | 'primary-6'
  | 'primary-7'
  | 'primary-8'
  | 'primary-9'
  | 'primary-10'
  | 'secondary-1'
  | 'secondary-2'
  | 'secondary-3'
  | 'secondary-4'
  | 'secondary-5'
  | 'secondary-6'
  | 'secondary-7'
  | 'secondary-8'
  | 'secondary-9'
  | 'secondary-10'
  | 'tertiary-1'
  | 'tertiary-2'
  | 'tertiary-3'
  | 'tertiary-4'
  | 'tertiary-5'
  | 'tertiary-6'
  | 'tertiary-7'
  | 'tertiary-8'
  | 'tertiary-9'
  | 'tertiary-10'
  | 'error-1'
  | 'error-2'
  | 'error-3'
  | 'error-4'
  | 'error-5'
  | 'error-6'
  | 'error-7'
  | 'error-8'
  | 'error-9'
  | 'error-10'
  | 'warning-1'
  | 'warning-2'
  | 'warning-3'
  | 'warning-4'
  | 'warning-5'
  | 'warning-6'
  | 'warning-7'
  | 'warning-8'
  | 'warning-9'
  | 'warning-10'
  | 'info-1'
  | 'info-2'
  | 'info-3'
  | 'info-4'
  | 'info-5'
  | 'info-6'
  | 'info-7'
  | 'info-8'
  | 'info-9'
  | 'info-10'
  | 'success-1'
  | 'success-2'
  | 'success-3'
  | 'success-4'
  | 'success-5'
  | 'success-6'
  | 'success-7'
  | 'success-8'
  | 'success-9'
  | 'success-10'
  | 'ink-1'
  | 'ink-2'
  | 'ink-3'
  | 'ink-4'
  | 'ink-5'
  | 'ink-6'
  | 'ink-7'
  | 'ink-8'
  | 'ink-9'
  | 'ink-10'
  | 'gray-1'
  | 'gray-2'
  | 'gray-3'
  | 'gray-4'
  | 'gray-5'
  | 'gray-6'
  | 'gray-7'
  | 'gray-8'
  | 'gray-9'
  | 'gray-10'
  | 'neutral-0'
  | 'neutral-1'
  | 'neutral-2'
  | 'neutral-3'
  | 'neutral-4'
  | 'neutral-5'
  | 'neutral-6'
  | 'neutral-7'
  | 'neutral-8'
  | 'neutral-9'
  | 'neutral-10'
  | 'white-1'
  | 'white-2'
  | 'white-3'
  | 'white-4'
  | 'white-5'
  | 'white-6'
  | 'white-7'
  | 'white-8'
  | 'white-9'
  | 'white-10'
  | 'black-1'
  | 'black-2'
  | 'black-3'
  | 'black-4'
  | 'black-5'
  | 'black-6'
  | 'black-7'
  | 'black-8'
  | 'black-9'
  | 'black-10'
  | 'brand'
  | 'bg-base'
  | 'bg-1'
  | 'bg-2'
  | 'bg-3'
  | 'bg-4'
  | 'bg-input'
  | 'bg-input-2'
  | 'bg-chart'
  | 'bg-popup'
  | 'bg-nav'
  | 'bg-dialog'
  | 'bg-dialog-2'
  | 'bg-skeleton'
  | 'bg-ink-light'
  | 'bg-ink-medium'
  | 'surface-primary'
  | 'surface-secondary'
  | 'surface-tertiary'
  | 'surface-success'
  | 'surface-info'
  | 'surface-warning'
  | 'surface-error'
  | 'surface-neutral'
  | 'bg-primary'
  | 'bg-secondary'
  | 'bg-tertiary'
  | 'bg-accent'
  | 'bg-success'
  | 'bg-info'
  | 'bg-warning'
  | 'bg-error'
  | 'bg-neutral'
  | 'bg-primary-strong'
  | 'bg-tertiary-strong'
  | 'press-overlay'
  | 'fg-1'
  | 'fg-2'
  | 'fg-3'
  | 'fg-4'
  | 'fg-5'
  | 'fg-inverse'
  | 'fg-inverse-muted'
  | 'fg-brand'
  | 'fg-brand-muted'
  | 'fg-accent'
  | 'fg-on-nav'
  | 'fg-on-nav-muted'
  | 'fg-on-nav-subtle'
  | 'fg-on-nav-accent'
  | 'fg-on-header'
  | 'fg-on-header-muted'
  | 'fg-on-popup'
  | 'fg-on-popup-muted'
  | 'fg-on-dialog'
  | 'fg-on-tooltip'
  | 'fg-on-dialog-muted'
  | 'fg-on-brand'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'link'
  | 'action-base'
  | 'action-hover'
  | 'action-press'
  | 'action-fg'
  | 'action-tint'
  | 'action-tint-strong'
  | 'indicator-muted'
  | 'action-accent'
  | 'action-accent-press'
  | 'action-accent-fg'
  | 'action-ink'
  | 'action-ink-hover'
  | 'action-ink-press'
  | 'action-ink-fg'
  | 'action-grey'
  | 'action-grey-hover'
  | 'action-grey-press'
  | 'action-white'
  | 'action-white-hover'
  | 'action-white-press'
  | 'action-white-light'
  | 'action-white-disabled'
  | 'action-disabled'
  | 'action-disabled-ink'
  | 'action-disabled-fg'
  | 'action-error'
  | 'action-error-hover'
  | 'action-error-press'
  | 'action-error-fg'
  | 'action-warning'
  | 'action-warning-press'
  | 'action-warning-fg'
  | 'action-success'
  | 'action-success-hover'
  | 'action-success-press'
  | 'action-success-fg'
  | 'action-info'
  | 'action-info-hover'
  | 'action-info-press'
  | 'action-info-fg'
  | 'border-1'
  | 'border-2'
  | 'border-strong'
  | 'border-brand'
  | 'border-brand-hover'
  | 'border-brand-press'
  | 'border-brand-subtle'
  | 'border-ink'
  | 'border-ink-hover'
  | 'border-ink-press'
  | 'border-ink-disabled'
  | 'border-white'
  | 'border-white-medium'
  | 'border-white-light'
  | 'border-error'
  | 'border-error-subtle'
  | 'border-warning'
  | 'border-warning-subtle'
  | 'border-info'
  | 'border-info-subtle'
  | 'border-success'
  | 'border-success-subtle'
  | 'divider-1'
  | 'divider-2'
  | 'overlay'
  | 'disabled-1'
  | 'disabled-2'
  | 'ring-focus'
  | 'ring-focus-neutral'
  | 'nav-border'
  | 'nav-divider'
  | 'nav-active-bg'
  | 'nav-from'
  | 'nav-to'
  | 'header-from'
  | 'header-to'
  | 'header-border'
  | 'popup-border'
  | 'popup-shadow'
  | 'bg-tooltip';

export const THEME_COLOR_KEYS = [
  'primary-1',
  'primary-2',
  'primary-3',
  'primary-4',
  'primary-5',
  'primary-6',
  'primary-7',
  'primary-8',
  'primary-9',
  'primary-10',
  'secondary-1',
  'secondary-2',
  'secondary-3',
  'secondary-4',
  'secondary-5',
  'secondary-6',
  'secondary-7',
  'secondary-8',
  'secondary-9',
  'secondary-10',
  'tertiary-1',
  'tertiary-2',
  'tertiary-3',
  'tertiary-4',
  'tertiary-5',
  'tertiary-6',
  'tertiary-7',
  'tertiary-8',
  'tertiary-9',
  'tertiary-10',
  'error-1',
  'error-2',
  'error-3',
  'error-4',
  'error-5',
  'error-6',
  'error-7',
  'error-8',
  'error-9',
  'error-10',
  'warning-1',
  'warning-2',
  'warning-3',
  'warning-4',
  'warning-5',
  'warning-6',
  'warning-7',
  'warning-8',
  'warning-9',
  'warning-10',
  'info-1',
  'info-2',
  'info-3',
  'info-4',
  'info-5',
  'info-6',
  'info-7',
  'info-8',
  'info-9',
  'info-10',
  'success-1',
  'success-2',
  'success-3',
  'success-4',
  'success-5',
  'success-6',
  'success-7',
  'success-8',
  'success-9',
  'success-10',
  'ink-1',
  'ink-2',
  'ink-3',
  'ink-4',
  'ink-5',
  'ink-6',
  'ink-7',
  'ink-8',
  'ink-9',
  'ink-10',
  'gray-1',
  'gray-2',
  'gray-3',
  'gray-4',
  'gray-5',
  'gray-6',
  'gray-7',
  'gray-8',
  'gray-9',
  'gray-10',
  'neutral-0',
  'neutral-1',
  'neutral-2',
  'neutral-3',
  'neutral-4',
  'neutral-5',
  'neutral-6',
  'neutral-7',
  'neutral-8',
  'neutral-9',
  'neutral-10',
  'white-1',
  'white-2',
  'white-3',
  'white-4',
  'white-5',
  'white-6',
  'white-7',
  'white-8',
  'white-9',
  'white-10',
  'black-1',
  'black-2',
  'black-3',
  'black-4',
  'black-5',
  'black-6',
  'black-7',
  'black-8',
  'black-9',
  'black-10',
  'brand',
  'bg-base',
  'bg-1',
  'bg-2',
  'bg-3',
  'bg-4',
  'bg-input',
  'bg-input-2',
  'bg-chart',
  'bg-popup',
  'bg-nav',
  'bg-dialog',
  'bg-dialog-2',
  'bg-skeleton',
  'bg-ink-light',
  'bg-ink-medium',
  'surface-primary',
  'surface-secondary',
  'surface-tertiary',
  'surface-success',
  'surface-info',
  'surface-warning',
  'surface-error',
  'surface-neutral',
  'bg-primary',
  'bg-secondary',
  'bg-tertiary',
  'bg-accent',
  'bg-success',
  'bg-info',
  'bg-warning',
  'bg-error',
  'bg-neutral',
  'bg-primary-strong',
  'bg-tertiary-strong',
  'press-overlay',
  'fg-1',
  'fg-2',
  'fg-3',
  'fg-4',
  'fg-5',
  'fg-inverse',
  'fg-inverse-muted',
  'fg-brand',
  'fg-brand-muted',
  'fg-accent',
  'fg-on-nav',
  'fg-on-nav-muted',
  'fg-on-nav-subtle',
  'fg-on-nav-accent',
  'fg-on-header',
  'fg-on-header-muted',
  'fg-on-popup',
  'fg-on-popup-muted',
  'fg-on-dialog',
  'fg-on-tooltip',
  'fg-on-dialog-muted',
  'fg-on-brand',
  'success',
  'info',
  'warning',
  'error',
  'link',
  'action-base',
  'action-hover',
  'action-press',
  'action-fg',
  'action-tint',
  'action-tint-strong',
  'indicator-muted',
  'action-accent',
  'action-accent-press',
  'action-accent-fg',
  'action-ink',
  'action-ink-hover',
  'action-ink-press',
  'action-ink-fg',
  'action-grey',
  'action-grey-hover',
  'action-grey-press',
  'action-white',
  'action-white-hover',
  'action-white-press',
  'action-white-light',
  'action-white-disabled',
  'action-disabled',
  'action-disabled-ink',
  'action-disabled-fg',
  'action-error',
  'action-error-hover',
  'action-error-press',
  'action-error-fg',
  'action-warning',
  'action-warning-press',
  'action-warning-fg',
  'action-success',
  'action-success-hover',
  'action-success-press',
  'action-success-fg',
  'action-info',
  'action-info-hover',
  'action-info-press',
  'action-info-fg',
  'border-1',
  'border-2',
  'border-strong',
  'border-brand',
  'border-brand-hover',
  'border-brand-press',
  'border-brand-subtle',
  'border-ink',
  'border-ink-hover',
  'border-ink-press',
  'border-ink-disabled',
  'border-white',
  'border-white-medium',
  'border-white-light',
  'border-error',
  'border-error-subtle',
  'border-warning',
  'border-warning-subtle',
  'border-info',
  'border-info-subtle',
  'border-success',
  'border-success-subtle',
  'divider-1',
  'divider-2',
  'overlay',
  'disabled-1',
  'disabled-2',
  'ring-focus',
  'ring-focus-neutral',
  'nav-border',
  'nav-divider',
  'nav-active-bg',
  'nav-from',
  'nav-to',
  'header-from',
  'header-to',
  'header-border',
  'popup-border',
  'popup-shadow',
  'bg-tooltip',
] as const satisfies readonly ThemeColorKey[];

/**
 * Màu chế độ SÁNG, dạng `#RRGGBB`.
 *
 * ⚠️ Đây là màu ĐẶC. Token vốn có độ trong bị cắt phần alpha ở đây vì phần lớn
 * prop màu thô của React Native (`tabBarActiveTintColor`, `<Ionicons color>`)
 * chỉ nhận màu đặc. Cần cả alpha thì tra thêm `TOKEN_ALPHA` bên dưới.
 */
export const LIGHT_COLORS: Record<ThemeColorKey, string> = {
  'primary-1': '#EBF5F5',
  'primary-2': '#DCEBE9',
  'primary-3': '#B8D0CE',
  'primary-4': '#54827C',
  'primary-5': '#00453C',
  'primary-6': '#003730',
  'primary-7': '#002C26',
  'primary-8': '#00241F',
  'primary-9': '#001D19',
  'primary-10': '#001411',
  'secondary-1': '#F7F3EB',
  'secondary-2': '#E7D9C0',
  'secondary-3': '#DBC7A2',
  'secondary-4': '#CBAD78',
  'secondary-5': '#B18535',
  'secondary-6': '#98712A',
  'secondary-7': '#7E5E26',
  'secondary-8': '#61491D',
  'secondary-9': '#4A3816',
  'secondary-10': '#32260F',
  'tertiary-1': '#FFF9EA',
  'tertiary-2': '#FFEDBF',
  'tertiary-3': '#FFE59F',
  'tertiary-4': '#FFD974',
  'tertiary-5': '#FFC62F',
  'tertiary-6': '#E8B42B',
  'tertiary-7': '#B58D21',
  'tertiary-8': '#8C6D1A',
  'tertiary-9': '#6B5314',
  'tertiary-10': '#49380E',
  'error-1': '#FBE6E6',
  'error-2': '#F9D9D9',
  'error-3': '#F3B0B0',
  'error-4': '#D90000',
  'error-5': '#C30000',
  'error-6': '#AE0000',
  'error-7': '#A30000',
  'error-8': '#820000',
  'error-9': '#620000',
  'error-10': '#430000',
  'warning-1': '#FDEFE6',
  'warning-2': '#FCE7D9',
  'warning-3': '#F8CEB0',
  'warning-4': '#EA6201',
  'warning-5': '#D35801',
  'warning-6': '#BB4E01',
  'warning-7': '#B04A01',
  'warning-8': '#8C3B01',
  'warning-9': '#692C00',
  'warning-10': '#471E00',
  'info-1': '#E7EDF8',
  'info-2': '#DBE4F5',
  'info-3': '#B6C7EA',
  'info-4': '#124ABC',
  'info-5': '#1043A9',
  'info-6': '#0E3B96',
  'info-7': '#0E388D',
  'info-8': '#0B2C71',
  'info-9': '#082155',
  'info-10': '#05163A',
  'success-1': '#E6F4E7',
  'success-2': '#D9EEDB',
  'success-3': '#B0DCB5',
  'success-4': '#008F0F',
  'success-5': '#00810E',
  'success-6': '#00720C',
  'success-7': '#006B0B',
  'success-8': '#005609',
  'success-9': '#004007',
  'success-10': '#002C05',
  'ink-1': '#F1F1F1',
  'ink-2': '#E1E1E1',
  'ink-3': '#969696',
  'ink-4': '#666666',
  'ink-5': '#1A1A1A',
  'ink-6': '#181818',
  'ink-7': '#121212',
  'ink-8': '#0E0E0E',
  'ink-9': '#0B0B0B',
  'ink-10': '#070707',
  'gray-1': '#FBFBFB',
  'gray-2': '#F6F6F6',
  'gray-3': '#EEEEEE',
  'gray-4': '#E6E6E6',
  'gray-5': '#D9D9D9',
  'gray-6': '#C5C5C5',
  'gray-7': '#9A9A9A',
  'gray-8': '#777777',
  'gray-9': '#5B5B5B',
  'gray-10': '#3E3E3E',
  'neutral-0': '#FFFFFF',
  'neutral-1': '#FBFBFB',
  'neutral-2': '#F6F6F6',
  'neutral-3': '#EEEEEE',
  'neutral-4': '#E6E6E6',
  'neutral-5': '#D9D9D9',
  'neutral-6': '#C5C5C5',
  'neutral-7': '#9A9A9A',
  'neutral-8': '#777777',
  'neutral-9': '#5B5B5B',
  'neutral-10': '#1A1A1A',
  'white-1': '#FFFFFF',
  'white-2': '#FFFFFF',
  'white-3': '#FFFFFF',
  'white-4': '#FFFFFF',
  'white-5': '#FFFFFF',
  'white-6': '#FFFFFF',
  'white-7': '#FFFFFF',
  'white-8': '#FFFFFF',
  'white-9': '#FFFFFF',
  'white-10': '#FFFFFF',
  'black-1': '#000000',
  'black-2': '#000000',
  'black-3': '#000000',
  'black-4': '#000000',
  'black-5': '#000000',
  'black-6': '#000000',
  'black-7': '#000000',
  'black-8': '#000000',
  'black-9': '#000000',
  'black-10': '#000000',
  'brand': '#00453C',
  'bg-base': '#F0F5F5',
  'bg-1': '#FFFFFF',
  'bg-2': '#FBFBFB',
  'bg-3': '#F6F6F6',
  'bg-4': '#EEEEEE',
  'bg-input': '#FFFFFF',
  'bg-input-2': '#F6F6F6',
  'bg-chart': '#FFFFFF',
  'bg-popup': '#FFFFFF',
  'bg-nav': '#FFFFFF',
  'bg-dialog': '#FFFFFF',
  'bg-dialog-2': '#F6F6F6',
  'bg-skeleton': '#E6EBEA',
  'bg-ink-light': '#F1F1F1',
  'bg-ink-medium': '#969696',
  'surface-primary': '#EBF5F5',
  'surface-secondary': '#F7F3EB',
  'surface-tertiary': '#FFF9EA',
  'surface-success': '#E6F4E7',
  'surface-info': '#E7EDF8',
  'surface-warning': '#FDEFE6',
  'surface-error': '#FBE6E6',
  'surface-neutral': '#F6F6F6',
  'bg-primary': '#00453C',
  'bg-secondary': '#B18535',
  'bg-tertiary': '#FFC62F',
  'bg-accent': '#FFC62F',
  'bg-success': '#00810E',
  'bg-info': '#1043A9',
  'bg-warning': '#D35801',
  'bg-error': '#C30000',
  'bg-neutral': '#969696',
  'bg-primary-strong': '#003E36',
  'bg-tertiary-strong': '#B18535',
  'press-overlay': '#1A1A1A',
  'fg-1': '#1A1A1A',
  'fg-2': '#666666',
  'fg-3': '#969696',
  'fg-4': '#C5C5C5',
  'fg-5': '#D9D9D9',
  'fg-inverse': '#FFFFFF',
  'fg-inverse-muted': '#FFFFFF',
  'fg-brand': '#00453C',
  'fg-brand-muted': '#54827C',
  'fg-accent': '#B18535',
  'fg-on-nav': '#FFFFFF',
  'fg-on-nav-muted': '#FFFFFF',
  'fg-on-nav-subtle': '#FFFFFF',
  'fg-on-nav-accent': '#FFFFFF',
  'fg-on-header': '#1A1A1A',
  'fg-on-header-muted': '#666666',
  'fg-on-popup': '#1A1A1A',
  'fg-on-popup-muted': '#666666',
  'fg-on-dialog': '#1A1A1A',
  'fg-on-tooltip': '#FFFFFF',
  'fg-on-dialog-muted': '#666666',
  'fg-on-brand': '#FFFFFF',
  'success': '#00810E',
  'info': '#1043A9',
  'warning': '#D35801',
  'error': '#C30000',
  'link': '#1043A9',
  'action-base': '#00453C',
  'action-hover': '#54827C',
  'action-press': '#003730',
  'action-fg': '#FFFFFF',
  'action-tint': '#EBF5F5',
  'action-tint-strong': '#B8D0CE',
  'indicator-muted': '#B8D0CE',
  'action-accent': '#B18535',
  'action-accent-press': '#98712A',
  'action-accent-fg': '#1A1A1A',
  'action-ink': '#1A1A1A',
  'action-ink-hover': '#666666',
  'action-ink-press': '#181818',
  'action-ink-fg': '#FFFFFF',
  'action-grey': '#EEEEEE',
  'action-grey-hover': '#D9D9D9',
  'action-grey-press': '#9A9A9A',
  'action-white': '#FFFFFF',
  'action-white-hover': '#FFFFFF',
  'action-white-press': '#FFFFFF',
  'action-white-light': '#FFFFFF',
  'action-white-disabled': '#FFFFFF',
  'action-disabled': '#E6E6E6',
  'action-disabled-ink': '#E1E1E1',
  'action-disabled-fg': '#969696',
  'action-error': '#C30000',
  'action-error-hover': '#D90000',
  'action-error-press': '#AE0000',
  'action-error-fg': '#FFFFFF',
  'action-warning': '#D35801',
  'action-warning-press': '#BB4E01',
  'action-warning-fg': '#FFFFFF',
  'action-success': '#00810E',
  'action-success-hover': '#008F0F',
  'action-success-press': '#00720C',
  'action-success-fg': '#FFFFFF',
  'action-info': '#1043A9',
  'action-info-hover': '#124ABC',
  'action-info-press': '#0E3B96',
  'action-info-fg': '#FFFFFF',
  'border-1': '#E6E6E6',
  'border-2': '#D9D9D9',
  'border-strong': '#969696',
  'border-brand': '#00453C',
  'border-brand-hover': '#54827C',
  'border-brand-press': '#003730',
  'border-brand-subtle': '#54827C',
  'border-ink': '#1A1A1A',
  'border-ink-hover': '#666666',
  'border-ink-press': '#181818',
  'border-ink-disabled': '#E1E1E1',
  'border-white': '#FFFFFF',
  'border-white-medium': '#FFFFFF',
  'border-white-light': '#FFFFFF',
  'border-error': '#C30000',
  'border-error-subtle': '#F3B0B0',
  'border-warning': '#D35801',
  'border-warning-subtle': '#F8CEB0',
  'border-info': '#1043A9',
  'border-info-subtle': '#B6C7EA',
  'border-success': '#00810E',
  'border-success-subtle': '#B0DCB5',
  'divider-1': '#EEEEEE',
  'divider-2': '#E6E6E6',
  'overlay': '#1A1A1A',
  'disabled-1': '#E6E6E6',
  'disabled-2': '#F6F6F6',
  'ring-focus': '#003E36',
  'ring-focus-neutral': '#1A1A1A',
  'nav-border': '#E6E6E6',
  'nav-divider': '#EEEEEE',
  'nav-active-bg': '#00453C',
  'nav-from': '#358676',
  'nav-to': '#014A3E',
  'header-from': '#A6CDCC',
  'header-to': '#F0F5F5',
  'header-border': '#DCEBE9',
  'popup-border': '#E6E6E6',
  'popup-shadow': '#1A1A1A',
  'bg-tooltip': '#003730',
};

/** Màu chế độ TỐI, dạng `#RRGGBB`. */
export const DARK_COLORS: Record<ThemeColorKey, string> = {
  'primary-1': '#EBF5F5',
  'primary-2': '#DCEBE9',
  'primary-3': '#B8D0CE',
  'primary-4': '#54827C',
  'primary-5': '#00453C',
  'primary-6': '#003730',
  'primary-7': '#002C26',
  'primary-8': '#00241F',
  'primary-9': '#001D19',
  'primary-10': '#001411',
  'secondary-1': '#F7F3EB',
  'secondary-2': '#E7D9C0',
  'secondary-3': '#DBC7A2',
  'secondary-4': '#CBAD78',
  'secondary-5': '#B18535',
  'secondary-6': '#98712A',
  'secondary-7': '#7E5E26',
  'secondary-8': '#61491D',
  'secondary-9': '#4A3816',
  'secondary-10': '#32260F',
  'tertiary-1': '#FFF9EA',
  'tertiary-2': '#FFEDBF',
  'tertiary-3': '#FFE59F',
  'tertiary-4': '#FFD974',
  'tertiary-5': '#FFC62F',
  'tertiary-6': '#E8B42B',
  'tertiary-7': '#B58D21',
  'tertiary-8': '#8C6D1A',
  'tertiary-9': '#6B5314',
  'tertiary-10': '#49380E',
  'error-1': '#FBE6E6',
  'error-2': '#F9D9D9',
  'error-3': '#F3B0B0',
  'error-4': '#D90000',
  'error-5': '#C30000',
  'error-6': '#AE0000',
  'error-7': '#A30000',
  'error-8': '#820000',
  'error-9': '#620000',
  'error-10': '#430000',
  'warning-1': '#FDEFE6',
  'warning-2': '#FCE7D9',
  'warning-3': '#F8CEB0',
  'warning-4': '#EA6201',
  'warning-5': '#D35801',
  'warning-6': '#BB4E01',
  'warning-7': '#B04A01',
  'warning-8': '#8C3B01',
  'warning-9': '#692C00',
  'warning-10': '#471E00',
  'info-1': '#E7EDF8',
  'info-2': '#DBE4F5',
  'info-3': '#B6C7EA',
  'info-4': '#124ABC',
  'info-5': '#1043A9',
  'info-6': '#0E3B96',
  'info-7': '#0E388D',
  'info-8': '#0B2C71',
  'info-9': '#082155',
  'info-10': '#05163A',
  'success-1': '#E6F4E7',
  'success-2': '#D9EEDB',
  'success-3': '#B0DCB5',
  'success-4': '#008F0F',
  'success-5': '#00810E',
  'success-6': '#00720C',
  'success-7': '#006B0B',
  'success-8': '#005609',
  'success-9': '#004007',
  'success-10': '#002C05',
  'ink-1': '#F1F1F1',
  'ink-2': '#E1E1E1',
  'ink-3': '#969696',
  'ink-4': '#666666',
  'ink-5': '#1A1A1A',
  'ink-6': '#181818',
  'ink-7': '#121212',
  'ink-8': '#0E0E0E',
  'ink-9': '#0B0B0B',
  'ink-10': '#070707',
  'gray-1': '#FBFBFB',
  'gray-2': '#F6F6F6',
  'gray-3': '#EEEEEE',
  'gray-4': '#E6E6E6',
  'gray-5': '#D9D9D9',
  'gray-6': '#C5C5C5',
  'gray-7': '#9A9A9A',
  'gray-8': '#777777',
  'gray-9': '#5B5B5B',
  'gray-10': '#3E3E3E',
  'neutral-0': '#FFFFFF',
  'neutral-1': '#FBFBFB',
  'neutral-2': '#F6F6F6',
  'neutral-3': '#EEEEEE',
  'neutral-4': '#E6E6E6',
  'neutral-5': '#D9D9D9',
  'neutral-6': '#C5C5C5',
  'neutral-7': '#9A9A9A',
  'neutral-8': '#777777',
  'neutral-9': '#5B5B5B',
  'neutral-10': '#1A1A1A',
  'white-1': '#FFFFFF',
  'white-2': '#FFFFFF',
  'white-3': '#FFFFFF',
  'white-4': '#FFFFFF',
  'white-5': '#FFFFFF',
  'white-6': '#FFFFFF',
  'white-7': '#FFFFFF',
  'white-8': '#FFFFFF',
  'white-9': '#FFFFFF',
  'white-10': '#FFFFFF',
  'black-1': '#000000',
  'black-2': '#000000',
  'black-3': '#000000',
  'black-4': '#000000',
  'black-5': '#000000',
  'black-6': '#000000',
  'black-7': '#000000',
  'black-8': '#000000',
  'black-9': '#000000',
  'black-10': '#000000',
  'brand': '#3ECFB2',
  'bg-base': '#070A0A',
  'bg-1': '#1E2826',
  'bg-2': '#2A3734',
  'bg-3': '#354441',
  'bg-4': '#40504D',
  'bg-input': '#1E2826',
  'bg-input-2': '#2A3734',
  'bg-chart': '#1E2826',
  'bg-popup': '#2A3734',
  'bg-nav': '#141B1A',
  'bg-dialog': '#232E2C',
  'bg-dialog-2': '#2E3B38',
  'bg-skeleton': '#2E3B38',
  'bg-ink-light': '#333F3C',
  'bg-ink-medium': '#6B7A76',
  'surface-primary': '#16332C',
  'surface-secondary': '#33291A',
  'surface-tertiary': '#40331A',
  'surface-success': '#14331F',
  'surface-info': '#16294A',
  'surface-warning': '#3A2A10',
  'surface-error': '#3B1A1A',
  'surface-neutral': '#313E3B',
  'bg-primary': '#3ECFB2',
  'bg-secondary': '#E3C07F',
  'bg-tertiary': '#FFCB5B',
  'bg-accent': '#FFCB5B',
  'bg-success': '#3DD68C',
  'bg-info': '#6BA8FF',
  'bg-warning': '#FFB020',
  'bg-error': '#FF6B6B',
  'bg-neutral': '#969696',
  'bg-primary-strong': '#3ECFB2',
  'bg-tertiary-strong': '#FFCB5B',
  'press-overlay': '#FFFFFF',
  'fg-1': '#F2F6F4',
  'fg-2': '#B7C4C0',
  'fg-3': '#83918C',
  'fg-4': '#66736F',
  'fg-5': '#4E5A57',
  'fg-inverse': '#08120F',
  'fg-inverse-muted': '#08120F',
  'fg-brand': '#57D9BE',
  'fg-brand-muted': '#8FE7D3',
  'fg-accent': '#F0C264',
  'fg-on-nav': '#FFFFFF',
  'fg-on-nav-muted': '#FFFFFF',
  'fg-on-nav-subtle': '#FFFFFF',
  'fg-on-nav-accent': '#FFFFFF',
  'fg-on-header': '#F2F6F4',
  'fg-on-header-muted': '#A9B8B4',
  'fg-on-popup': '#F2F6F4',
  'fg-on-popup-muted': '#A9B8B4',
  'fg-on-dialog': '#F2F6F4',
  'fg-on-tooltip': '#08201C',
  'fg-on-dialog-muted': '#A9B8B4',
  'fg-on-brand': '#04231D',
  'success': '#4ADE9B',
  'info': '#7DB3FF',
  'warning': '#FFBE45',
  'error': '#FF7B7B',
  'link': '#7DB3FF',
  'action-base': '#3ECFB2',
  'action-hover': '#4AD5BA',
  'action-press': '#57DBC1',
  'action-fg': '#04231D',
  'action-tint': '#16332C',
  'action-tint-strong': '#1E4A41',
  'indicator-muted': '#26564C',
  'action-accent': '#F0B84B',
  'action-accent-press': '#D69F35',
  'action-accent-fg': '#1A1A1A',
  'action-ink': '#E8EEEC',
  'action-ink-hover': '#FFFFFF',
  'action-ink-press': '#C7D2CE',
  'action-ink-fg': '#0B1211',
  'action-grey': '#2E3B38',
  'action-grey-hover': '#3C4C48',
  'action-grey-press': '#42514D',
  'action-white': '#FFFFFF',
  'action-white-hover': '#FFFFFF',
  'action-white-press': '#FFFFFF',
  'action-white-light': '#FFFFFF',
  'action-white-disabled': '#FFFFFF',
  'action-disabled': '#24302D',
  'action-disabled-ink': '#26332F',
  'action-disabled-fg': '#7C8A86',
  'action-error': '#FF6B6B',
  'action-error-hover': '#FF8585',
  'action-error-press': '#E05555',
  'action-error-fg': '#1F0404',
  'action-warning': '#FFB020',
  'action-warning-press': '#E09A16',
  'action-warning-fg': '#2E1B00',
  'action-success': '#3DD68C',
  'action-success-hover': '#5CE3A2',
  'action-success-press': '#2FB876',
  'action-success-fg': '#032516',
  'action-info': '#6BA8FF',
  'action-info-hover': '#8ABCFF',
  'action-info-press': '#4F8FE6',
  'action-info-fg': '#041631',
  'border-1': '#3C4C48',
  'border-2': '#4E5E5A',
  'border-strong': '#697874',
  'border-brand': '#3ECFB2',
  'border-brand-hover': '#5CDCC2',
  'border-brand-press': '#57DBC1',
  'border-brand-subtle': '#2C5A4F',
  'border-ink': '#E8EEEC',
  'border-ink-hover': '#C7D2CE',
  'border-ink-press': '#FFFFFF',
  'border-ink-disabled': '#35423F',
  'border-white': '#FFFFFF',
  'border-white-medium': '#FFFFFF',
  'border-white-light': '#FFFFFF',
  'border-error': '#FF6B6B',
  'border-error-subtle': '#5A2828',
  'border-warning': '#FFB020',
  'border-warning-subtle': '#5A421C',
  'border-info': '#6BA8FF',
  'border-info-subtle': '#274169',
  'border-success': '#3DD68C',
  'border-success-subtle': '#234E3A',
  'divider-1': '#2F3D39',
  'divider-2': '#3C4C48',
  'overlay': '#040A09',
  'disabled-1': '#FFFFFF',
  'disabled-2': '#FFFFFF',
  'ring-focus': '#3ECFB2',
  'ring-focus-neutral': '#FFFFFF',
  'nav-border': '#2A3734',
  'nav-divider': '#22302D',
  'nav-active-bg': '#3ECFB2',
  'nav-from': '#12463C',
  'nav-to': '#05201B',
  'header-from': '#14332C',
  'header-to': '#070A0A',
  'header-border': '#20443C',
  'popup-border': '#3C4C48',
  'popup-shadow': '#000000',
  'bg-tooltip': '#DCEDE8',
};

/** Độ trong gốc của những token KHÔNG đục. Token không có tên ở đây ⇒ alpha = 1. */
export const TOKEN_ALPHA: Partial<Record<ThemeColorKey, { light: number; dark: number }>> = {
  'white-1': { light: 0.102, dark: 0.102 },
  'white-2': { light: 0.2, dark: 0.2 },
  'white-3': { light: 0.302, dark: 0.302 },
  'white-4': { light: 0.4, dark: 0.4 },
  'white-5': { light: 0.502, dark: 0.502 },
  'white-6': { light: 0.6, dark: 0.6 },
  'white-7': { light: 0.702, dark: 0.702 },
  'white-8': { light: 0.8, dark: 0.8 },
  'white-9': { light: 0.929, dark: 0.929 },
  'black-1': { light: 0.102, dark: 0.102 },
  'black-2': { light: 0.2, dark: 0.2 },
  'black-3': { light: 0.302, dark: 0.302 },
  'black-4': { light: 0.4, dark: 0.4 },
  'black-5': { light: 0.502, dark: 0.502 },
  'black-6': { light: 0.6, dark: 0.6 },
  'black-7': { light: 0.702, dark: 0.702 },
  'black-8': { light: 0.8, dark: 0.8 },
  'black-9': { light: 0.929, dark: 0.929 },
  'bg-popup': { light: 0.98, dark: 0.98 },
  'bg-nav': { light: 0.94, dark: 0.94 },
  'bg-primary': { light: 0.102, dark: 0.102 },
  'bg-secondary': { light: 0.102, dark: 0.102 },
  'bg-tertiary': { light: 0.102, dark: 0.102 },
  'bg-accent': { light: 0.102, dark: 0.102 },
  'bg-success': { light: 0.102, dark: 0.102 },
  'bg-info': { light: 0.102, dark: 0.102 },
  'bg-warning': { light: 0.102, dark: 0.102 },
  'bg-error': { light: 0.102, dark: 0.102 },
  'bg-neutral': { light: 0.102, dark: 0.102 },
  'bg-primary-strong': { light: 0.2, dark: 0.2 },
  'bg-tertiary-strong': { light: 0.2, dark: 0.2 },
  'press-overlay': { light: 0.1, dark: 0.12 },
  'fg-inverse-muted': { light: 0.8, dark: 0.8 },
  'fg-on-nav-muted': { light: 0.8, dark: 0.8 },
  'fg-on-nav-subtle': { light: 0.6, dark: 0.6 },
  'action-white-hover': { light: 0.8, dark: 0.8 },
  'action-white-press': { light: 0.6, dark: 0.6 },
  'action-white-light': { light: 0.4, dark: 0.4 },
  'action-white-disabled': { light: 0.8, dark: 0.8 },
  'border-white-medium': { light: 0.6, dark: 0.6 },
  'border-white-light': { light: 0.4, dark: 0.4 },
  'overlay': { light: 0.8, dark: 0.82 },
  'disabled-1': { light: 1, dark: 0.08 },
  'disabled-2': { light: 1, dark: 0.04 },
  'ring-focus': { light: 0.1, dark: 0.28 },
  'ring-focus-neutral': { light: 0.1, dark: 0.12 },
  'nav-active-bg': { light: 0.1, dark: 0.16 },
  'popup-shadow': { light: 0.12, dark: 0.7 },
};
