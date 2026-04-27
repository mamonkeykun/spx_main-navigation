import { act, renderHook, waitFor } from '@testing-library/react';
import { DEFAULT_NAV_CONFIG } from '../types/navTypes';
import { useNavConfig } from './useNavConfig';

const usingMock = jest.fn();
const spfiMock = jest.fn();
const selectMock = jest.fn();
const updateMock = jest.fn();

function mockSelectResult(value: unknown): void {
  selectMock.mockImplementationOnce(() => jest.fn().mockResolvedValue(value));
}

jest.mock('@pnp/sp', () => ({
  spfi: (...args: unknown[]) => spfiMock(...args),
}));

jest.mock('@pnp/sp/presets/all', () => ({
  SPFx: jest.fn(() => 'spfx-behavior'),
}));

describe('useNavConfig', () => {
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
          select: selectMock,
          update: updateMock,
        },
      }),
    });
  });

  it('returns DEFAULT_NAV_CONFIG when no stored config exists', async () => {
    mockSelectResult({
      AllProperties: {},
    });

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toEqual(DEFAULT_NAV_CONFIG);
    expect(result.current.error).toBeNull();
  });

  it('merges stored config over defaults correctly', async () => {
    mockSelectResult({
      AllProperties: {
        OrigamiNavConfig: JSON.stringify({
          version: 1,
          logoUrl: '/logo.svg',
          showBreadcrumb: true,
        }),
      },
    });

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toEqual({
      ...DEFAULT_NAV_CONFIG,
      logoUrl: '/logo.svg',
      showBreadcrumb: true,
    });
  });

  it('falls back to defaults when stored config JSON is invalid', async () => {
    mockSelectResult({
      AllProperties: {
        OrigamiNavConfig: '{bad json',
      },
    });

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config).toEqual(DEFAULT_NAV_CONFIG);
  });

  it('migrates older versions to the current config version', async () => {
    mockSelectResult({
      AllProperties: {
        OrigamiNavConfig: JSON.stringify({
          version: 0,
          logoUrl: '/legacy.svg',
        }),
      },
    });

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.config.version).toBe(1);
    expect(result.current.config.logoUrl).toBe('/legacy.svg');
  });

  it('saveConfig updates state optimistically and persists merged config', async () => {
    mockSelectResult({
      AllProperties: {},
    });
    updateMock.mockResolvedValue({});

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.saveConfig({
        logoUrl: '/next.svg',
        showBreadcrumb: true,
      });
    });

    expect(result.current.config.logoUrl).toBe('/next.svg');
    expect(result.current.config.showBreadcrumb).toBe(true);
    expect(updateMock).toHaveBeenCalledWith({
      AllProperties: {
        OrigamiNavConfig: JSON.stringify({
          ...DEFAULT_NAV_CONFIG,
          logoUrl: '/next.svg',
          showBreadcrumb: true,
        }),
      },
    });
  });

  it('reverts the optimistic update and sets error when save fails', async () => {
    mockSelectResult({
      AllProperties: {},
    });
    updateMock.mockRejectedValue(new Error('save failed'));

    const { result } = renderHook(() => useNavConfig(context));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.saveConfig({
          logoUrl: '/broken.svg',
        });
      })
    ).rejects.toThrow('save failed');

    expect(result.current.config).toEqual(DEFAULT_NAV_CONFIG);
    expect(result.current.error).toBe('save failed');
  });
});
