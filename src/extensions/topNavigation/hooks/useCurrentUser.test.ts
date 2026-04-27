import { renderHook, waitFor } from '@testing-library/react';
import { useCurrentUser } from './useCurrentUser';

const usingMock = jest.fn();
const spfiMock = jest.fn();
const groupsMock = jest.fn();

jest.mock('@pnp/sp', () => ({
  spfi: (...args: unknown[]) => spfiMock(...args),
}));

jest.mock('@pnp/sp/presets/all', () => ({
  SPFx: jest.fn(() => 'spfx-behavior'),
}));

describe('useCurrentUser', () => {
  const context = {
    pageContext: {
      web: {
        absoluteUrl: 'https://tenant.sharepoint.com/sites/current',
      },
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();

    spfiMock.mockReturnValue({
      using: usingMock.mockReturnValue({
        web: {
          currentUser: {
            groups: groupsMock,
          },
        },
      }),
    });
  });

  it('returns normalized current user group names', async () => {
    groupsMock.mockResolvedValue([
      { LoginName: ' Group A ' },
      { LoginName: 'Group B' },
      { LoginName: 'Group A' },
      {},
    ]);

    const { result } = renderHook(() => useCurrentUser(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.groups).toEqual(['Group A', 'Group B']);
    expect(result.current.error).toBeNull();
  });

  it('returns an empty group list and sets error when lookup fails', async () => {
    groupsMock.mockRejectedValue(new Error('group lookup failed'));

    const { result } = renderHook(() => useCurrentUser(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.groups).toEqual([]);
    expect(result.current.error).toBe('group lookup failed');
  });
});
