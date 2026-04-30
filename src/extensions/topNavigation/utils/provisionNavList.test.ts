import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@pnp/sp/webs', () => ({}));
jest.mock('@pnp/sp/lists', () => ({}));
jest.mock('@pnp/sp/fields', () => ({}));

import { navListExists, provisionNavList } from './provisionNavList';

type SelectInvoker = () => Promise<unknown>;

interface MockList {
  select: (value: string) => SelectInvoker;
  update: (properties: { EnableFolderCreation: boolean }) => Promise<unknown>;
  defaultView: () => Promise<{ Id: string }>;
  getView: (id: string) => {
    fields: {
      add: (name: string) => Promise<unknown>;
    };
  };
  fields: {
    addText: (name: string, properties: { Required: boolean }) => Promise<unknown>;
    addNumber: (name: string, properties: { Required: boolean }) => Promise<{
      field: {
        update: (properties: { DefaultValue: string }) => Promise<unknown>;
      };
    }>;
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
        enableContentTypes: boolean
      ) => Promise<unknown>;
      getByTitle: (value: string) => MockList;
    };
  };
}

function createMockSp(
  listExists: boolean
): { sp: MockSp; list: MockList; viewFieldAddMock: ReturnType<typeof jest.fn> } {
  const viewFieldAddMock = jest.fn().mockResolvedValue(undefined);
  const navOrderUpdateMock = jest.fn().mockResolvedValue(undefined);
  const addTextMock = jest.fn().mockResolvedValue(undefined);
  const addNumberMock = jest.fn().mockImplementation(() =>
    Promise.resolve({
      field: {
        update: navOrderUpdateMock,
      },
    })
  );
  const addBooleanMock = jest.fn().mockResolvedValue(undefined);
  const selectMock = jest.fn();
  const updateMock = jest.fn().mockResolvedValue(undefined);
  const defaultViewMock = jest.fn().mockResolvedValue({ Id: 'view-id' });
  const getViewMock = jest.fn().mockReturnValue({
    fields: {
      add: viewFieldAddMock,
    },
  });
  const list = {
    select: selectMock,
    update: updateMock,
    defaultView: defaultViewMock,
    getView: getViewMock,
    fields: {
      addText: addTextMock,
      addNumber: addNumberMock,
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

  return { sp, list, viewFieldAddMock };
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
    expect(list.fields.addBoolean).not.toHaveBeenCalled();
  });

  it('provisionNavList creates list and all 4 columns when list is missing', async () => {
    const { sp, list, viewFieldAddMock } = createMockSp(false);

    await provisionNavList(sp as never);

    expect(sp.web.lists.add).toHaveBeenCalledWith('Navigation', '', 100, false);
    expect(list.update).toHaveBeenCalledWith({ EnableFolderCreation: true });
    expect(list.fields.addText).toHaveBeenCalledTimes(2);
    expect(list.fields.addText).toHaveBeenNthCalledWith(1, 'NavUrl', { Required: false });
    expect(list.fields.addText).toHaveBeenNthCalledWith(2, 'NavDescription', {
      Required: false,
    });
    expect(list.fields.addNumber).toHaveBeenCalledTimes(1);
    expect(list.fields.addNumber).toHaveBeenCalledWith('NavOrder', {
      Required: false,
    });
    expect(list.fields.addBoolean).toHaveBeenCalledWith('NavOpenInNewTab', {
      Required: false,
    });
    expect(viewFieldAddMock).toHaveBeenCalledTimes(4);
    expect(viewFieldAddMock).toHaveBeenNthCalledWith(1, 'NavUrl');
    expect(viewFieldAddMock).toHaveBeenNthCalledWith(2, 'NavDescription');
    expect(viewFieldAddMock).toHaveBeenNthCalledWith(3, 'NavOrder');
    expect(viewFieldAddMock).toHaveBeenNthCalledWith(4, 'NavOpenInNewTab');
  });
});
