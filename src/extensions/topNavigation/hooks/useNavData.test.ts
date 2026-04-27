import { renderHook, waitFor, act } from '@testing-library/react';
import { useNavData } from './useNavData';

const usingMock = jest.fn();
const spfiMock = jest.fn();
const selectMock = jest.fn();
const filterMock = jest.fn();
const getByTitleMock = jest.fn();

function mockSelectResult(value: unknown): void {
  selectMock.mockImplementationOnce(() => jest.fn().mockResolvedValue(value));
}

function mockSelectError(error: Error): void {
  selectMock.mockImplementationOnce(() => jest.fn().mockRejectedValue(error));
}

function createHttpError(status: number, message: string): Error & { status: number } {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

jest.mock('@pnp/sp', () => ({
  spfi: (...args: unknown[]) => spfiMock(...args),
}));

jest.mock('@pnp/sp/presets/all', () => ({
  SPFx: jest.fn(() => 'spfx-behavior'),
}));

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
    jest.useRealTimers();

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

  it('returns empty arrays and loading=false when SharePoint returns no rows', async () => {
    mockSelectResult([]);
    mockSelectResult([]);

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.folders).toEqual([]);
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('maps the SharePoint response into NavFolder and NavItem shapes', async () => {
    mockSelectResult([
      {
        Id: 10,
        Title: 'Policies',
        NavOrder: 2,
        NavAllowedGroups: '["HR"]',
      },
    ]);
    mockSelectResult([
      {
        Id: 2,
        Title: 'Home',
        NavUrl: '/home',
        NavDescription: 'Landing page',
        NavOrder: 1,
        NavAllowedGroups: '["Everyone"]',
        NavOpenInNewTab: true,
      },
      {
        Id: 1,
        Title: 'Leave Policy',
        NavUrl: '/leave',
        NavOrder: null,
        NavFolderId: 10,
        NavAllowedGroups: 'not-json',
        NavOpenInNewTab: null,
      },
    ]);

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual([
      {
        id: 1,
        title: 'Leave Policy',
        url: '/leave',
        description: undefined,
        order: 0,
        folderId: 10,
        allowedGroups: [],
        openInNewTab: false,
      },
      {
        id: 2,
        title: 'Home',
        url: '/home',
        description: 'Landing page',
        order: 1,
        folderId: undefined,
        allowedGroups: ['Everyone'],
        openInNewTab: true,
      },
    ]);

    expect(result.current.folders).toEqual([
      {
        id: 10,
        title: 'Policies',
        order: 2,
        allowedGroups: ['HR'],
        items: [
          {
            id: 1,
            title: 'Leave Policy',
            url: '/leave',
            description: undefined,
            order: 0,
            folderId: 10,
            allowedGroups: [],
            openInNewTab: false,
          },
        ],
      },
    ]);
  });

  it('sets an error state when the SharePoint call throws and keeps previous data', async () => {
    mockSelectResult([]);
    mockSelectResult([
      {
        Id: 2,
        Title: 'Home',
        NavUrl: '/home',
        NavOrder: 1,
        NavAllowedGroups: '[]',
        NavOpenInNewTab: false,
      },
    ]);

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    selectMock.mockReset();
    mockSelectError(new Error('boom'));

    await act(async () => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.error).toBe('boom'));

    expect(result.current.items).toEqual([
      {
        id: 2,
        title: 'Home',
        url: '/home',
        description: undefined,
        order: 1,
        folderId: undefined,
        allowedGroups: [],
        openInNewTab: false,
      },
    ]);
  });

  it('calls the source site URL when sourceUrl is provided', async () => {
    mockSelectResult([]);
    mockSelectResult([]);

    renderHook(() => useNavData(context, 'https://tenant.sharepoint.com/sites/source'));

    await waitFor(() => expect(selectMock).toHaveBeenCalledTimes(2));

    expect(spfiMock).toHaveBeenCalledWith('https://tenant.sharepoint.com/sites/source');
  });

  it('reload triggers a refetch', async () => {
    mockSelectResult([]);
    mockSelectResult([]);
    mockSelectResult([]);
    mockSelectResult([]);

    const { result } = renderHook(() => useNavData(context));

    await waitFor(() => expect(selectMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      result.current.reload();
    });

    await waitFor(() => expect(selectMock).toHaveBeenCalledTimes(4));
  });

  it('returns a cross-site permission error for 403 responses', async () => {
    mockSelectError(createHttpError(403, 'forbidden'));

    const { result } = renderHook(() =>
      useNavData(context, 'https://tenant.sharepoint.com/sites/source')
    );

    await waitFor(() =>
      expect(result.current.error).toBe('参照先サイトへのアクセス権限がありません')
    );
  });

  it('falls back to the local site when the cross-site request times out', async () => {
    jest.useFakeTimers();

    selectMock
      .mockImplementationOnce(
        () =>
          jest.fn(
            () =>
              new Promise(() => {
                return undefined;
              })
          )
      )
      .mockImplementationOnce(
        () =>
          jest.fn(
            () =>
              new Promise(() => {
                return undefined;
              })
          )
      );
    mockSelectResult([]);
    mockSelectResult([
      {
        Id: 7,
        Title: 'Local Home',
        NavUrl: '/local',
        NavOrder: 1,
        NavAllowedGroups: '[]',
        NavOpenInNewTab: false,
      },
    ]);

    const { result } = renderHook(() =>
      useNavData(context, 'https://tenant.sharepoint.com/sites/source')
    );

    await act(async () => {
      jest.advanceTimersByTime(8000);
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(result.current.error).toBe('参照先サイトへの接続がタイムアウトしました')
    );
    expect(result.current.items).toEqual([
      {
        id: 7,
        title: 'Local Home',
        url: '/local',
        description: undefined,
        order: 1,
        folderId: undefined,
        allowedGroups: [],
        openInNewTab: false,
      },
    ]);
  });
});
