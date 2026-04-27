import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, type SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/presets/all';
import '@pnp/sp/presets/all';
import type { NavItem } from '../../../extensions/topNavigation/types/navTypes';

const NAVIGATION_LIST_TITLE = 'Navigation';

export interface ItemDraft {
  title: string;
  url: string;
  description?: string;
  openInNewTab: boolean;
}

export interface SiteGroupInfo {
  Id: number;
  Title: string;
  LoginName: string;
}

/**
 * Creates a PnPjs instance scoped to the current settings web part site.
 */
export function createSettingsSp(context: WebPartContext): SPFI {
  return spfi(context.pageContext.web.absoluteUrl).using(SPFx(context));
}

/**
 * Creates a folder-like navigation row stored as a list item without a URL.
 */
export async function createFolder(sp: SPFI, title: string, order: number): Promise<void> {
  await sp.web.lists.getByTitle(NAVIGATION_LIST_TITLE).items.add({
    Title: title,
    NavOrder: order,
    NavUrl: '',
    NavAllowedGroups: '[]',
    NavOpenInNewTab: false,
  });
}

/**
 * Updates an existing folder label.
 */
export async function updateFolder(sp: SPFI, id: number, title: string): Promise<void> {
  await sp.web.lists.getByTitle(NAVIGATION_LIST_TITLE).items.getById(id).update({
    Title: title,
  });
}

/**
 * Deletes a folder row and all children assigned to it.
 */
export async function deleteFolder(sp: SPFI, folderId: number, childIds: number[]): Promise<void> {
  await Promise.all([
    ...childIds.map((id) => sp.web.lists.getByTitle(NAVIGATION_LIST_TITLE).items.getById(id).delete()),
    sp.web.lists.getByTitle(NAVIGATION_LIST_TITLE).items.getById(folderId).delete(),
  ]);
}

/**
 * Creates a navigation item under the selected folder or top level.
 */
export async function createItem(
  sp: SPFI,
  draft: ItemDraft,
  folderId: number | undefined,
  order: number
): Promise<void> {
  await sp.web.lists.getByTitle(NAVIGATION_LIST_TITLE).items.add({
    Title: draft.title,
    NavUrl: draft.url,
    NavDescription: draft.description ?? '',
    NavOrder: order,
    NavFolderId: folderId,
    NavAllowedGroups: '[]',
    NavOpenInNewTab: draft.openInNewTab,
  });
}

/**
 * Updates a navigation item.
 */
export async function updateItem(sp: SPFI, id: number, draft: ItemDraft): Promise<void> {
  await sp.web.lists.getByTitle(NAVIGATION_LIST_TITLE).items.getById(id).update({
    Title: draft.title,
    NavUrl: draft.url,
    NavDescription: draft.description ?? '',
    NavOpenInNewTab: draft.openInNewTab,
  });
}

/**
 * Deletes a navigation item.
 */
export async function deleteItem(sp: SPFI, id: number): Promise<void> {
  await sp.web.lists.getByTitle(NAVIGATION_LIST_TITLE).items.getById(id).delete();
}

/**
 * Rewrites item order values as multiples of 10 after a drag-and-drop reorder.
 */
export async function reorderItems(sp: SPFI, orderedItems: NavItem[]): Promise<void> {
  await Promise.all(
    orderedItems.map((item, index) =>
      sp.web.lists.getByTitle(NAVIGATION_LIST_TITLE).items.getById(item.id).update({
        NavOrder: index * 10,
      })
    )
  );
}

/**
 * Persists allowed group login names for a folder or item row.
 */
export async function saveAllowedGroups(sp: SPFI, id: number, groups: string[]): Promise<void> {
  await sp.web.lists.getByTitle(NAVIGATION_LIST_TITLE).items.getById(id).update({
    NavAllowedGroups: JSON.stringify(groups),
  });
}

/**
 * Loads all site groups available for permission targeting.
 */
export async function loadSiteGroups(sp: SPFI): Promise<SiteGroupInfo[]> {
  return sp.web.siteGroups.select('Id', 'Title', 'LoginName')<SiteGroupInfo[]>();
}
