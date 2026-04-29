import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@pnp/sp/webs', () => ({}));
jest.mock('@pnp/sp/lists', () => ({}));
jest.mock('@pnp/sp/fields', () => ({}));

import { navListExists, provisionNavList } from './provisionNavList';

type SelectInvoker = () => Promise<unknown>;

interface MockList {
  select: (value: string) => SelectInvoker;
  fields: {
    addText: (name: string, properties: { Required: boolean }) => Promise<unknown>;
    addNumber: (name: string, properties: { Required: boolean }) => Promise<{
      field: {
        update: (properties: { DefaultValue: string }) => Promise<unknown>;
      };
    }>;
    addMultilineText: (
      name: string,
      properties: { Required: boolean; NumberOfLines: number }
    ) => Promise<unknown>;
    addBoolean: (name: string, properties: { Required: boolean }) => Promise<unknown>;
  };
}

interface MockSp {
  web: {
    lists: {
      add: (
        title: string,
        description: string,
        template: number,
        enableContentTypes: boolean,
        properties: { EnableFolderCreation: boolean }
      ) => Promise<unknown>;
      getByTitle: (value: string) => MockList;
    };
  };
}

function createMockSp(
  listExists: boolean
): { sp: MockSp; list: MockList; navOrderUpdateMock: ReturnType<typeof jest.fn> } {
  const navOrderUpdateMock = jest.fn().mockResolvedValue(undefined);
  const addTextMock = jest.fn().mockResolvedValue(undefined);
  const addNumberMock = jest.fn().mockImplementation(() =>
    Promise.resolve({
      field: {
        update: navOrderUpdateMock,
      },
    })
  );
  const addMultilineTextMock = jest.fn().mockResolvedValue(undefined);
  const addBooleanMock = jest.fn().mockResolvedValue(undefined);
  const selectMock = jest.fn();
  const list = {
    select: selectMock,
    fields: {
      addText: addTextMock,
      addNumber: addNumberMock,
      addMultilineText: addMultilineTextMock,
      addBoolean: addBooleanMock,
    },
  } as unknown as MockList;

  if (listExists) {
    selectMock.mockReturnValue(jest.fn().mockResolvedValue({ Id: 'list-id' }));
  } else {
    selectMock.mockReturnValue(jest.fn().mockRejectedValue(new Error('404')));
  }

  const addListMock = jest.fn().mockResolvedValue(undefined);
  const getByTitleMock = jest.fn().mockReturnValue(list);

  const sp = {
    web: {
      lists: {
        add: addListMock,
        getByTitle: getByTitleMock,
      },
    },
  } as unknown as MockSp;

  return { sp, list, navOrderUpdateMock };
}

describe('provisionNavList', () => {
  it('navListExists returns true when list exists', async () => {
    const { sp } = createMockSp(true);

    await expect(navListExists(sp as never)).resolves.toBe(true);
  });

  it('navListExists returns false when list does not exist', async () => {
    const { sp } = createMockSp(false);

    await expect(navListExists(sp as never)).resolves.toBe(false);
  });

  it('provisionNavList skips creation when list already exists', async () => {
    const { sp, list } = createMockSp(true);

    await provisionNavList(sp as never);

    expect(sp.web.lists.add).not.toHaveBeenCalled();
    expect(list.fields.addText).not.toHaveBeenCalled();
    expect(list.fields.addNumber).not.toHaveBeenCalled();
    expect(list.fields.addMultilineText).not.toHaveBeenCalled();
    expect(list.fields.addBoolean).not.toHaveBeenCalled();
  });

  it('provisionNavList creates list and all 6 columns when list is missing', async () => {
    const { sp, list, navOrderUpdateMock } = createMockSp(false);

    await provisionNavList(sp as never);

    expect(sp.web.lists.add).toHaveBeenCalledWith('Navigation', '', 100, false, {
      EnableFolderCreation: true,
    });
    expect(list.fields.addText).toHaveBeenCalledTimes(2);
    expect(list.fields.addText).toHaveBeenNthCalledWith(1, 'NavUrl', { Required: false });
    expect(list.fields.addText).toHaveBeenNthCalledWith(2, 'NavDescription', {
      Required: false,
    });
    expect(list.fields.addNumber).toHaveBeenCalledTimes(2);
    expect(list.fields.addNumber).toHaveBeenNthCalledWith(1, 'NavOrder', {
      Required: false,
    });
    expect(list.fields.addNumber).toHaveBeenNthCalledWith(2, 'NavFolderId', {
      Required: false,
    });
    expect(list.fields.addMultilineText).toHaveBeenCalledWith('NavAllowedGroups', {
      Required: false,
      NumberOfLines: 2,
    });
    expect(list.fields.addBoolean).toHaveBeenCalledWith('NavOpenInNewTab', {
      Required: false,
    });
    expect(navOrderUpdateMock).toHaveBeenCalledWith({
      DefaultValue: '0',
    });
  });
});
