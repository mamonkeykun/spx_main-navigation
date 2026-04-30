/**
 * Top-level navigation folder (= SharePoint list folder).
 * Visibility is controlled by SharePoint item-level permissions.
 */
export interface NavFolder {
  id: string;
  spItemId: number;
  label: string;
  url?: string;
  order: number;
  folderPath: string;
}

/**
 * Child navigation link (= SharePoint list item inside a folder).
 * Visibility is controlled by SharePoint item-level permissions.
 */
export interface NavItem {
  id: string;
  spItemId: number;
  label: string;
  url: string;
  description?: string;
  order: number;
  parentFolderPath: string;
  openInNewTab: boolean;
}

/**
 * Visual and behavior configuration stored in the web properties bag.
 */
export interface NavConfig {
  version: number;
  logoUrl?: string;
  logoSize: number;
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  fontSize: number;
  hideSharePointNav: boolean;
  showBreadcrumb: boolean;
  breadcrumbFontSize: number;
  showLanguagePicker: boolean;
  dropdownLayout: 'vertical' | 'horizontal';
  sourceUrl?: string;
}

export type DropdownLayout = 'vertical' | 'horizontal';

export const DEFAULT_NAV_CONFIG: NavConfig = {
  version: 1,
  logoSize: 40,
  backgroundColor: '#ffffff',
  textColor: '#000000',
  hoverColor: '#0078d4',
  fontSize: 16,
  hideSharePointNav: true,
  showBreadcrumb: false,
  breadcrumbFontSize: 13,
  showLanguagePicker: false,
  dropdownLayout: 'vertical',
};
