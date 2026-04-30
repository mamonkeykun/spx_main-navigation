import { type SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/fields';

const LIST_TITLE = 'Navigation';

/**
 * Checks if the Navigation list exists.
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
 * Provisions the Navigation list with required columns.
 */
export async function provisionNavList(sp: SPFI): Promise<void> {
  const exists = await navListExists(sp);
  if (exists) {
    return;
  }

  await sp.web.lists.add(LIST_TITLE, '', 100, false);

  const list = sp.web.lists.getByTitle(LIST_TITLE);
  await list.update({ EnableFolderCreation: true });
  const navOrderFieldPromise = list.fields.addNumber('NavOrder', {
    Required: false,
  });

  await Promise.all([
    list.fields.addText('NavUrl', { Required: false }),
    list.fields.addText('NavDescription', { Required: false }),
    navOrderFieldPromise,
    list.fields.addBoolean('NavOpenInNewTab', { Required: false }),
  ]);

  const navOrderField = await navOrderFieldPromise;
  await navOrderField.field.update({ DefaultValue: '0' });

  const view = await (
    list as unknown as {
      defaultView: () => Promise<{ Id: string }>;
    }
  ).defaultView();
  const viewFields = (
    list as unknown as {
      getView: (id: string) => {
        fields: {
          add: (name: string) => Promise<unknown>;
        };
      };
    }
  ).getView(view.Id).fields;

  await Promise.all([
    viewFields.add('NavUrl'),
    viewFields.add('NavDescription'),
    viewFields.add('NavOrder'),
    viewFields.add('NavOpenInNewTab'),
  ]);
}
