import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';

const LIST_TITLE = 'Navigation';

/**
 * Checks if the Navigation list exists on the site.
 */
export async function navListExists(sp: SPFI): Promise<boolean> {
  try {
    await sp.web.lists.getByTitle(LIST_TITLE).select('Id')();
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates the Navigation list with all required columns.
 * Safe to call even if the list already exists.
 */
export async function provisionNavList(sp: SPFI): Promise<void> {
  const exists = await navListExists(sp);

  if (exists) {
    return;
  }

  await sp.web.lists.add(LIST_TITLE, '', 100, false, {
    EnableFolderCreation: true,
  });

  const list = sp.web.lists.getByTitle(LIST_TITLE);
  const navOrderFieldPromise = list.fields.addNumber('NavOrder', { Required: false });

  await Promise.all([
    list.fields.addText('NavUrl', { Required: false }),
    list.fields.addText('NavDescription', { Required: false }),
    navOrderFieldPromise,
    list.fields.addNumber('NavFolderId', { Required: false }),
    list.fields.addMultilineText('NavAllowedGroups', {
      Required: false,
      NumberOfLines: 2,
    }),
    list.fields.addBoolean('NavOpenInNewTab', { Required: false }),
  ]);

  const navOrderField = await navOrderFieldPromise;
  await navOrderField.field.update({
    DefaultValue: '0',
  });
}
