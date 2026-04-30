import * as React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useNavData } from './useNavData';

const usingMock = jest.fn();
const spfiMock = jest.fn();
const getByTitleMock = jest.fn();
const filterMock = jest.fn();
const selectMock = jest.fn();
function createQueryResult(result: unknown): ReturnType<typeof jest.fn> {
  const query = jest.fn().mockResolvedValue(result) as ReturnType<typeof jest.fn> & {
    orderBy: ReturnType<typeof jest.fn>;
  };
  query.orderBy = jest.fn(() => query);
  return query;
}

function queueQueryResult(result: unknown): void {
  selectMock.mockImplementationOnce(() => createQueryResult(result));
}

function queueQueryError(error: Error): void {
  const query = jest.fn().mockRejectedValue(error) as ReturnType<typeof jest.fn> & {
    orderBy: ReturnType<typeof jest.fn>;
  };
  query.orderBy = jest.fn(() => query);
  selectMock.mockImplementationOnce(() => query);
}

jest.mock('@pnp/sp', () => ({
  spfi: (...args: unknown[]) => spfiMock(...args),
  SPFx: jest.fn(() => 'spfx-behavior'),
}));

jest.mock('@pnp/sp/webs', () => ({}));
jest.mock('@pnp/sp/lists', () => ({}));
jest.mock('@pnp/sp/items', () => ({}));
jest.mock('@pnp/sp/folders', () => ({}));

function renderHook<T>(callback: () => T): { result: { current: T } } {
  const result = { current: undefined as unknown as T };

  function TestComponent(): React.ReactElement | null {
    result.current = callback();
    return React.createElement(React.Fragment);
  }

  render(React.createElement(TestComponent));

  return { result };
}

describe('useNavData', () => {
  const context = {
    pageContext: {
      web: {
        absoluteUrl: 'https://tenant.sharepoint.com/sites/current',
      },
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();

    filterMock.mockReturnValue({
      select: selectMock,
    });

    getByTitleMock.mockReturnValue({
      items: {
        filter: filterMock,
      },
    });

    spfiMock.mockReturnValue({
      using: usingMock.mockReturnValue({
        web: {
          lists: {
            getByTitle: getByTitleMock,
          },
        },
      }),
    });
  });

  it('returns empty arrays when SharePoint returns no rows', async () => {
    queueQueryResult([]);
    queueQueryResult([]);

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.folders).toEqual([]);
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('maps folders and items using FileDirRef', async () => {
    queueQueryResult([
      {
        Id: 10,
        Title: 'Employee Resources',
        NavUrl: '/resources',
        NavOrder: 2,
        FileDirRef: '/sites/current/Lists/Navigation/Employee Resources',
      },
    ]);
    queueQueryResult([
      {
        Id: 2,
        Title: 'Policies',
        NavUrl: '/policies',
        NavDescription: '社内ポリシー',
        NavOrder: 1,
        NavOpenInNewTab: true,
        FileDirRef: '/sites/current/Lists/Navigation/Employee Resources',
      },
    ]);

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.folders).toEqual([
      {
        id: '10',
        spItemId: 10,
        label: 'Employee Resources',
        url: '/resources',
        order: 2,
        folderPath: '/sites/current/Lists/Navigation/Employee Resources',
      },
    ]);

    expect(result.current.items).toEqual([
      {
        id: '2',
        spItemId: 2,
        label: 'Policies',
        url: '/policies',
        description: '社内ポリシー',
        order: 1,
        parentFolderPath: '/sites/current/Lists/Navigation/Employee Resources',
        openInNewTab: true,
      },
    ]);

    expect(result.current.getItemsForFolder(result.current.folders[0])).toEqual([
      {
        id: '2',
        spItemId: 2,
        label: 'Policies',
        url: '/policies',
        description: '社内ポリシー',
        order: 1,
        parentFolderPath: '/sites/current/Lists/Navigation/Employee Resources',
        openInNewTab: true,
      },
    ]);
  });

  it('getItemsForFolder returns only matching folder items', async () => {
    queueQueryResult([
      {
        Id: 10,
        Title: 'HR',
        NavOrder: 1,
        FileDirRef: '/sites/current/Lists/Navigation/HR',
      },
      {
        Id: 11,
        Title: 'IT',
        NavOrder: 2,
        FileDirRef: '/sites/current/Lists/Navigation/IT',
      },
    ]);
    queueQueryResult([
      {
        Id: 21,
        Title: '休暇申請',
        NavUrl: '/leave',
        NavOrder: 1,
        FileDirRef: '/sites/current/Lists/Navigation/HR',
      },
      {
        Id: 22,
        Title: 'デバイス申請',
        NavUrl: '/device',
        NavOrder: 1,
        FileDirRef: '/sites/current/Lists/Navigation/IT',
      },
    ]);

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getItemsForFolder(result.current.folders[0])).toEqual([
      {
        id: '21',
        spItemId: 21,
        label: '休暇申請',
        url: '/leave',
        description: undefined,
        order: 1,
        parentFolderPath: '/sites/current/Lists/Navigation/HR',
        openInNewTab: false,
      },
    ]);
  });

  it('getTopLevelItems excludes items that belong to known folders', async () => {
    queueQueryResult([
      {
        Id: 10,
        Title: 'HR',
        NavOrder: 1,
        FileDirRef: '/sites/current/Lists/Navigation/HR',
      },
    ]);
    queueQueryResult([
      {
        Id: 21,
        Title: '休暇申請',
        NavUrl: '/leave',
        NavOrder: 1,
        FileDirRef: '/sites/current/Lists/Navigation/HR',
      },
      {
        Id: 22,
        Title: 'ホーム',
        NavUrl: '/home',
        NavOrder: 1,
        FileDirRef: '/sites/current/Lists/Navigation',
      },
    ]);

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getTopLevelItems()).toEqual([
      {
        id: '22',
        spItemId: 22,
        label: 'ホーム',
        url: '/home',
        description: undefined,
        order: 1,
        parentFolderPath: '/sites/current/Lists/Navigation',
        openInNewTab: false,
      },
    ]);
  });

  it('reload triggers a refetch', async () => {
    queueQueryResult([]);
    queueQueryResult([]);
    queueQueryResult([]);
    queueQueryResult([]);

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(selectMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      result.current.reload();
    });

    await waitFor(() => expect(selectMock).toHaveBeenCalledTimes(4));
  });

  it('calls the source site URL when sourceUrl is provided', async () => {
    queueQueryResult([]);
    queueQueryResult([]);

    renderHook(() => useNavData(context, 'https://tenant.sharepoint.com/sites/source'));

    await waitFor(() => expect(selectMock).toHaveBeenCalledTimes(2));

    expect(spfiMock).toHaveBeenCalledWith('https://tenant.sharepoint.com/sites/source');
  });

  it('sets a generic error when the SharePoint call throws', async () => {
    queueQueryError(new Error('boom'));
    queueQueryError(new Error('boom'));

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() =>
      expect(result.current.error).toBe('ナビゲーションデータの取得に失敗しました')
    );
  });

  it('returns empty arrays after a 404 response', async () => {
    queueQueryError(new Error('404 not found'));
    queueQueryError(new Error('404 not found'));

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.folders).toEqual([]);
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
