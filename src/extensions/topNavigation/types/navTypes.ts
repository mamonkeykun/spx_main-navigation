export type DropdownLayout = 'vertical' | 'horizontal';
export type LogoSize = 'small' | 'medium' | 'large';
export type FontSize = 'sm' | 'md' | 'lg';

export interface Language {
  code: string;
  label: string;
}

export interface NavItem {
  id: number;
  title: string;
  url: string;
  description?: string;
  order: number;
  folderId?: number;
  allowedGroups: string[];
  openInNewTab: boolean;
}

export interface NavFolder {
  id: number;
  title: string;
  order: number;
  allowedGroups: string[];
  items: NavItem[];
}

export interface NavConfig {
  version: number;
  logoUrl: string;
  logoSize: LogoSize;
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  accentColor: string;
  fontSize: FontSize;
  fontFamily: string;
  dropdownLayout: DropdownLayout;
  showBreadcrumb: boolean;
  breadcrumbFontSize: FontSize;
  hideSharePointNav: boolean;
  showLanguagePicker: boolean;
  availableLanguages: Language[];
  currentLanguage: string;
  sourceUrl: string;
}

export interface NavConfigVersion extends NavConfig {
  version: number;
}

export const DEFAULT_NAV_CONFIG: NavConfig = {
  version: 1,
  logoUrl: '',
  logoSize: 'medium',
  backgroundColor: '#0F172A',
  textColor: '#F8FAFC',
  hoverColor: '#38BDF8',
  accentColor: '#0EA5E9',
  fontSize: 'md',
  fontFamily: 'system-ui, sans-serif',
  dropdownLayout: 'vertical',
  showBreadcrumb: false,
  breadcrumbFontSize: 'sm',
  hideSharePointNav: true,
  showLanguagePicker: false,
  availableLanguages: [],
  currentLanguage: 'ja',
  sourceUrl: '',
};
